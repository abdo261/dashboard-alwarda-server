const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a Subject
async function createSubject(req, res) {
  const { name, pricePerMonth } = req.body;
  try {
    const existingSubject = await prisma.subjects.findUnique({
      where: { name },
    });

    if (existingSubject) {
      return res.status(400).json({ message: 'Le sujet existe déjà' });
    }

    const newSubject = await prisma.subjects.create({
      data: {
        name,
        pricePerMonth,
      },
    });

    res.status(201).json({ message: 'Sujet créé avec succès', subject: newSubject });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du sujet: ' + error.message });
  }
}

// Get All Subjects
async function getAllSubjects(req, res) {
  try {
    const subjects = await prisma.subjects.findMany({
      include: { students: true },  // Include students for each subject
    });

    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des sujets: ' + error.message });
  }
}

// Get Subject by ID
async function getSubjectById(req, res) {
  const { id } = req.params;
  try {
    const subject = await prisma.subjects.findUnique({
      where: { id: parseInt(id) },
      include: { students: true },  // Include students for the subject
    });

    if (!subject) {
      return res.status(404).json({ message: 'Sujet non trouvé' });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status500().json({ message: 'Erreur lors de la récupération du sujet: ' + error.message });
  }
}

// Update Subject
async function updateSubject(req, res) {
  const { id } = req.params;
  const { name, pricePerMonth } = req.body;
  try {
    const updatedSubject = await prisma.subjects.update({
      where: { id: parseInt(id) },
      data: {
        name,
        pricePerMonth,
      },
    });

    res.status(200).json({ message: 'Sujet mis à jour avec succès', subject: updatedSubject });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du sujet: ' + error.message });
  }
}

// Delete Subject
async function deleteSubject(req, res) {
  const { id } = req.params;
  try {
    await prisma.subjects.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Sujet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du sujet: ' + error.message });
  }
}

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
