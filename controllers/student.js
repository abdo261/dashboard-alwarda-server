const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createStudent(req, res) {
  const {
    firstName,
    lastName,
    phoneParent,
    phone,
    sex,
    registrationDate,
    registredBy,
    levelId,
    centreId,
    subjectIds,
  } = req.body;
  try {
    const user = await prisma.users.findUnique({ where: { id: registredBy } });
    if (!user)
      return res.status(400).json({ message: "Utilisateur non trouvé" });

    const level = await prisma.levels.findUnique({ where: { id: levelId } });
    if (!level) return res.status(400).json({ message: "Niveau non trouvé" });

    const centre = await prisma.centres.findUnique({ where: { id: centreId } });
    if (!centre) return res.status(400).json({ message: "Centre non trouvé" });

    const newStudent = await prisma.students.create({
      data: {
        firstName,
        lastName,
        phoneParent,
        phone,
        sex,
        registrationDate,
        registredBy,
        levelId,
        centreId,
        subjects: {
          connect: subjectIds.map((id) => ({ id })),
        },
      },
      include: {
        user: true,
        level: true,
        centre: true,
        subjects: true,
        payments: true,
      },
    });

    const subjects = await prisma.subjects.findMany({
      where: { id: { in: subjectIds } },
    });

    const totalSubjects = subjects.length;
    const totalAmount = subjects.reduce(
      (sum, subject) => sum + subject.pricePerMonth,
      0
    );
    const discount = totalSubjects > 1 ? 50 * totalSubjects : 0;
    const finalAmount = totalAmount - discount;

    const dueDate = new Date(registrationDate);
    dueDate.setDate(dueDate.getDate() + 31);

    await prisma.payments.create({
      data: {
        studentId: newStudent.id,
        month: dueDate.toLocaleString("default", { month: "long" }), // e.g., "August"
        totalAmount: finalAmount,
        amountPaid: 0,
        amountDue: finalAmount,
        discount: discount,
        dueDate: dueDate,
      },
    });

    res
      .status(201)
      .json({
        message: "Étudiant créé avec succès et paiement enregistré",
        student: newStudent,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur lors de la création de l'étudiant: " + error.message,
      });
  }
}

async function getAllStudents(req, res) {
  try {
    const students = await prisma.students.findMany({
      include: {
        user: true,
        level: true,
        centre: true,
        subjects: true,
        payments: true,
      },
    });

    res.status(200).json(students);
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          "Erreur lors de la récupération des étudiants: " + error.message,
      });
  }
}

async function getStudentById(req, res) {
  const { id } = req.params;
  try {
    const student = await prisma.students.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        level: true,
        centre: true,
        subjects: true,
        payments: true,
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Étudiant non trouvé" });
    }

    res.status(200).json(student);
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          "Erreur lors de la récupération de l'étudiant: " + error.message,
      });
  }
}

async function updateStudent(req, res) {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    phoneParent,
    phone,
    sex,
    registrationDate,
    registredBy,
    levelId,
    centreId,
    subjectIds,
  } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { id: registredBy } });
    if (!user)
      return res.status(400).json({ message: "Utilisateur non trouvé" });

    const level = await prisma.levels.findUnique({ where: { id: levelId } });
    if (!level) return res.status(400).json({ message: "Niveau non trouvé" });

    const centre = await prisma.centres.findUnique({ where: { id: centreId } });
    if (!centre) return res.status(400).json({ message: "Centre non trouvé" });

    // Update the student's subjects
    const updatedStudent = await prisma.students.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        phoneParent,
        phone,
        sex,
        registrationDate,
        registredBy,
        levelId,
        centreId,
        subjects: {
          set: subjectIds.map((id) => ({ id })),
        },
      },
      include: {
        user: true,
        level: true,
        centre: true,
        subjects: true,
        payments: true,
      },
    });

    // Find the payment for the current month
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    const currentPayment = await prisma.payments.findFirst({
      where: {
        studentId: updatedStudent.id,
        month: currentMonth,
      },
    });

    if (currentPayment) {
      const subjects = await prisma.subjects.findMany({
        where: { id: { in: subjectIds } },
      });

      const totalSubjects = subjects.length;
      const totalAmount = subjects.reduce(
        (sum, subject) => sum + subject.pricePerMonth,
        0
      );
      const discount = totalSubjects > 1 ? 50 * totalSubjects : 0;
      const finalAmount = totalAmount - discount;

      await prisma.payments.update({
        where: { id: currentPayment.id },
        data: {
          totalAmount: finalAmount,
          discount: discount,
          amountDue: finalAmount - currentPayment.amountPaid,
        },
      });
    }

    res
      .status(200)
      .json({
        message: "Étudiant et paiement mis à jour avec succès",
        student: updatedStudent,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          "Erreur lors de la mise à jour de l'étudiant: " + error.message,
      });
  }
}

async function deleteStudent(req, res) {
  const { id } = req.params;
  try {
    await prisma.students.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Étudiant supprimé avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          "Erreur lors de la suppression de l'étudiant: " + error.message,
      });
  }
}

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
