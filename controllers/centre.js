const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get All Centers with deep relations
async function getAllCenters(req, res) {
  try {
    const centres = await prisma.centres.findMany({
      include: {
        students: {
          include: {
            level: true,
            subjects: true,
            payments: true,  
          },
        },
        user: true,
      },
    });
    res.status(200).json(centres);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des centres: " + error.message });
  }
}

// Get Center by ID with deep relations
async function getCenterById(req, res) {
  const { id } = req.params;
  try {
    const centre = await prisma.centres.findUnique({
      where: { id: parseInt(id) },
      include: {
        students: {
          include: {
            level: true,
            subjects: true,
            payments: true,  // Updated to use 'payments'
          },
        },
        user: true,
      },
    });
    if (!centre) {
      return res.status(404).json({ message: 'Centre non trouvé' });
    }
    res.status(200).json(centre);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du centre: " + error.message });
  }
}

// Create a New Center
async function createCenter(req, res) {
  const { name, location, userId,color } = req.body;
  try {
    // Check if the center name already exists
    const existingCentre = await prisma.centres.findUnique({
      where: { name },
    });
    if (existingCentre) {
      return res.status(400).json({ message: 'Un centre avec ce nom existe déjà' });
    }

    const centre = await prisma.centres.create({
      data: {
        name,
        location,
        color,
        user: userId ? { connect: { id: userId } } : undefined,
      },
      include: {
        students: {
          include: {
            level: true,
            subjects: true,
            payments: true,  // Updated to use 'payments'
          },
        },
        user: true,
      },
    });
    res.status(201).json({ message: 'Centre créé avec succès', centre });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du centre: " + error.message });
  }
}

// Update a Center by ID
async function updateCenter(req, res) {
  const { id } = req.params;
  const { name, location, userId,color } = req.body;
  try {
    // Check if the center exists
    const existingCentre = await prisma.centres.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingCentre) {
      return res.status(404).json({ message: 'Centre non trouvé' });
    }

    // Check if the new name already exists for another center
    if (name && name !== existingCentre.name) {
      const nameExists = await prisma.centres.findUnique({
        where: { name },
      });
      if (nameExists) {
        return res.status(400).json({ message: 'Un autre centre avec ce nom existe déjà' });
      }
    }

    const contre = await prisma.centres.update({
      where: { id: parseInt(id) },
      data: {
        name,
        location,
        color,
        user: userId ? { connect: { id: userId } } : undefined,
      },
      include: {
        students: {
          include: {
            level: true,
            subjects: true,
            payments: true,  // Updated to use 'payments'
          },
        },
        user: true,
      },
    });
    res.status(200).json({ message: 'Centre mis à jour avec succès', contre });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du centre: " + error.message });
  }
}

// Delete a Center by ID
async function deleteCenter(req, res) {
  const { id } = req.params;
  try {
    // Check if the center exists
    const existingcentre = await prisma.centres.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingcentre) {
      return res.status(404).json({ message: 'Centre non trouvé' });
    }

    await prisma.centres.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: 'Centre supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du centre: " + error.message });
  }
}


module.exports = {
  getAllCenters,
  getCenterById,
  createCenter,
  updateCenter,
  deleteCenter,
};
