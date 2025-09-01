const Client = require('../models/Client');
const ClientCredentials = require('../models/ClientCredentials');
const { sendEmail } = require('../config/emailConfig');
const { emailTemplates } = require('../config/emailConfig');
const { generateSecurePassword } = require('../utils/passwordGenerator');

// @desc    Create a new client profile
// @route   POST /api/clients
// @access  Private (e.g., only authenticated caregivers/admins)
exports.createClientProfile = async (req, res) => {
    try {
        // Ensure createdBy is set from authenticated user
        const clientData = {
            ...req.body,
            createdBy: req.user.id
        };
        
        // Create client profile
        const client = await Client.create(clientData);
        
        // Check if email exists in client data
        const clientEmail = client.contactDetails?.email || client.personalInfo?.email;
        if (!clientEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'Client email is required for user account creation' 
            });
        }
        
        // Generate password for user
        const generatedPassword = generateSecurePassword(12);
        
        // Create corresponding user account
        const credentials = await ClientCredentials.create({
            email: clientEmail,
            passwordHash: generatedPassword,
            clientProfileId: client._id,
        });
        
        // Send credentials email
        try {
            await sendEmail(
                clientEmail,
                emailTemplates.credentialsEmail(clientEmail, generatedPassword, 'client')
            );
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Don't fail the entire operation if email fails
        }
        
        res.status(201).json({ 
            success: true, 
            data: client,
            credentialsId: credentials._id,
            message: 'Client profile and credentials created successfully. Credentials email sent.'
        });
    } catch (error) {
        console.error('Error creating client profile:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: messages 
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server Error while creating client profile' 
        });
    }
};

// @desc    Get all client profiles
// @route   GET /api/clients
// @access  Private (e.g., only authenticated caregivers/admins)
exports.getAllClientProfiles = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;
        
        // Build query
        let query = {};
        
        if (search) {
            query.$or = [
                { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
                { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
                { 'contactDetails.email': { $regex: search, $options: 'i' } }
            ];
        }
        
        if (status) {
            query.status = status;
        }
        
        const clients = await Client.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Client.countDocuments(query);
        
        res.status(200).json({ 
            success: true, 
            count: clients.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: clients 
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error while fetching clients' 
        });
    }
};

// @desc    Get a single client profile by ID
// @route   GET /api/clients/:id
// @access  Private (e.g., only authenticated caregivers/admins, or the client themselves)
exports.getClientProfileById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id)
            .populate('createdBy', 'name email');
            
        if (!client) {
            return res.status(404).json({ 
                success: false, 
                message: 'Client profile not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: client 
        });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error while fetching client' 
        });
    }
};

// @desc    Update a client profile by ID
// @route   PUT /api/clients/:id
// @access  Private (e.g., only authenticated caregivers/admins, or the client themselves)
exports.updateClientProfile = async (req, res) => {
    try {
        // Remove createdBy from update to prevent modification
        const { createdBy, ...updateData } = req.body;
        
        const client = await Client.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            {
                new: true, // Return the updated document
                runValidators: true, // Run Mongoose validators on update
            }
        ).populate('createdBy', 'name email');

        if (!client) {
            return res.status(404).json({ 
                success: false, 
                message: 'Client profile not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: client,
            message: 'Client profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating client:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed',
                errors: messages 
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server Error while updating client profile' 
        });
    }
};

// @desc    Delete a client profile by ID
// @route   DELETE /api/clients/:id
// @access  Private (e.g., only authenticated caregivers/admins)
exports.deleteClientProfile = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);

        if (!client) {
            return res.status(404).json({ 
                success: false, 
                message: 'Client profile not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Client profile deleted successfully',
            data: client 
        });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error while deleting client profile' 
        });
    }
};

// @desc    Get client statistics
// @route   GET /api/clients/stats
// @access  Private (admin only)
exports.getClientStats = async (req, res) => {
    try {
        const totalClients = await Client.countDocuments();
        const activeClients = await Client.countDocuments({ status: 'Active' });
        const inactiveClients = await Client.countDocuments({ status: 'Inactive' });
        
        res.status(200).json({
            success: true,
            data: {
                total: totalClients,
                active: activeClients,
                inactive: inactiveClients
            }
        });
    } catch (error) {
        console.error('Error fetching client stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error while fetching statistics' 
        });
    }
};
