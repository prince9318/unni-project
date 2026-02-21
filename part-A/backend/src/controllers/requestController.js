import Request from '../models/Request.js';
import Equipment from '../models/Equipment.js';

export const createRequest = async (req, res, next) => {
  try {
    const { equipmentId, notes } = req.body;

    if (!equipmentId) {
      return res.status(400).json({ message: 'Equipment is required' });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const request = await Request.create({
      requester: req.user.id,
      equipment: equipmentId,
      notes,
    });

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
};

export const listRequests = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate('requester', 'name email role')
      .populate('equipment', 'name description')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    next(err);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await Request.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('requester', 'name email role')
      .populate('equipment', 'name description');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (err) {
    next(err);
  }
};

