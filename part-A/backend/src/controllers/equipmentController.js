import Equipment from '../models/Equipment.js';

export const createEquipment = async (req, res, next) => {
  try {
    const { name, description, quantity } = req.body;

    if (!name || quantity == null) {
      return res
        .status(400)
        .json({ message: 'Name and quantity are required' });
    }

    const equipment = await Equipment.create({
      name,
      description,
      quantity,
      createdBy: req.user.id,
    });

    res.status(201).json(equipment);
  } catch (err) {
    next(err);
  }
};

export const listEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.find().sort({ name: 1 });
    res.json(equipment);
  } catch (err) {
    next(err);
  }
};

export const updateEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, quantity } = req.body;

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      {
        name,
        description,
        quantity,
      },
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (err) {
    next(err);
  }
};

