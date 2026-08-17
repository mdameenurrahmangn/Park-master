const asyncHandler = require('express-async-handler');
const Vehicle = require('../models/Vehicle');
const Member = require('../models/Member');

// @desc    Get all vehicles (with optional member filter)
// @route   GET /api/vehicles
// @access  Private
const getVehicles = asyncHandler(async (req, res) => {
  const { memberId, search, page = 1, pageSize = 10 } = req.query;
  
  const query = {};
  if (memberId) query.member = memberId;
  
  if (search) {
    query.$or = [
      { vehicleNumber: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { registrationNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const count = await Vehicle.countDocuments(query);
  const vehicles = await Vehicle.find(query)
    .populate('member', 'ownerName phone email')
    .sort({ createdAt: -1 })
    .limit(pageSize * 1)
    .skip(pageSize * (page - 1));

  res.json({
    vehicles,
    page: Number(page),
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id)
    .populate('member', 'ownerName phone email address');
  
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  res.json(vehicle);
});

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = asyncHandler(async (req, res) => {
  const { vehicleNumber, member, company, model } = req.body;

  // Validate required fields
  if (!member || !company || !model) {
    res.status(400);
    throw new Error('Member, company, and model are required');
  }

  // Check for duplicate vehicle number if provided
  const formattedVehicleNumber = vehicleNumber ? vehicleNumber.trim().toUpperCase().replace(/\s/g, '') : undefined;
  if (formattedVehicleNumber) {
    const existing = await Vehicle.findOne({ vehicleNumber: formattedVehicleNumber });
    if (existing) {
      res.status(400);
      throw new Error('Vehicle number already registered in the system');
    }
  }

  // Verify member exists and is active
  const memberExists = await Member.findById(member);
  if (!memberExists || memberExists.status !== 'active') {
    res.status(400);
    throw new Error('Invalid or inactive member');
  }

  // Handle file uploads
  const vehicleData = {
    ...req.body,
    vehicleNumber: formattedVehicleNumber || '',
    vehiclePhoto: req.files?.vehiclePhoto?.[0]?.filename 
      ? `/uploads/vehicles/${req.files.vehiclePhoto[0].filename}` 
      : undefined,
    rcUpload: req.files?.rcUpload?.[0]?.filename 
      ? `/uploads/vehicles/${req.files.rcUpload[0].filename}` 
      : undefined
  };

  const vehicle = await Vehicle.create(vehicleData);
  
  // Populate member for response
  const populatedVehicle = await Vehicle.findById(vehicle._id)
    .populate('member', 'ownerName phone');

  res.status(201).json(populatedVehicle);
});

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  // Check for duplicate vehicle number (excluding current vehicle)
  if (req.body.vehicleNumber) {
    const existing = await Vehicle.findOne({
      vehicleNumber: req.body.vehicleNumber.toUpperCase().replace(/\s/g, ''),
      _id: { $ne: req.params.id }
    });
    
    if (existing) {
      res.status(400);
      throw new Error('Vehicle number already registered');
    }
    req.body.vehicleNumber = req.body.vehicleNumber.toUpperCase().replace(/\s/g, '');
  }

  // Handle file uploads
  if (req.files?.vehiclePhoto?.[0]) {
    req.body.vehiclePhoto = `/uploads/vehicles/${req.files.vehiclePhoto[0].filename}`;
  }
  if (req.files?.rcUpload?.[0]) {
    req.body.rcUpload = `/uploads/vehicles/${req.files.rcUpload[0].filename}`;
  }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('member', 'ownerName phone');

  res.json(updatedVehicle);
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  await vehicle.deleteOne();
  res.json({ message: 'Vehicle removed successfully' });
});

// @desc    Get vehicles with upcoming expiry (Insurance/Pollution)
// @route   GET /api/vehicles/expiring
// @access  Private
const getExpiringVehicles = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + Number(days));

  const vehicles = await Vehicle.find({
    $or: [
      { insuranceExpiry: { $lte: thresholdDate, $gte: new Date() } },
      { pollutionExpiry: { $lte: thresholdDate, $gte: new Date() } }
    ],
    status: { $ne: 'inactive' }
  })
  .populate('member', 'ownerName phone')
  .sort({ insuranceExpiry: 1, pollutionExpiry: 1 });

  res.json(vehicles);
});

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getExpiringVehicles
};