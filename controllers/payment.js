const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new payment
async function createPayment(req, res) {
  const {
    studentId,
    month,
    totalAmount,
    amountPaid,
    amountDue,
    discount,
    dueDate,
  } = req.body;

  try {
    const newPayment = await prisma.payments.create({
      data: {
        studentId,
        month,
        totalAmount,
        amountPaid,
        amountDue,
        discount,
        dueDate: new Date(dueDate), 
      },
    });
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ error: "Error creating payment: " + error.message });
  }
}

// Get all payments
async function getAllPayments(req, res) {
  try {
    const payments = await prisma.payments.findMany({
      include: {
        student: {
          include: {
            user: true,
            level: true,
            centre: true,
            subjects: true,
          },
        },
      },
    });
    res.status(200).json(payments);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching payments: " + error.message });
  }
}

// Get payment by ID
async function getPaymentById(req, res) {
  const { id } = req.params;

  try {
    const payment = await prisma.payments.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        student: {
          include: {
            user: true,
            level: true,
            centre: true,
            subjects: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: "Error fetching payment: " + error.message });
  }
}

// Update a payment
async function updatePayment(req, res) {
  const { id } = req.params;
  const { month, totalAmount, amountPaid, amountDue, discount, dueDate } =
    req.body;

  try {
    const updatedPayment = await prisma.payments.update({
      where: { id: parseInt(id, 10) },
      data: {
        month,
        totalAmount,
        amountPaid,
        amountDue: amountDue || totalAmount - amountPaid,
        discount,
        dueDate: new Date(dueDate), 
      },
    });
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(500).json({ error: "Error updating payment: " + error.message });
  }
}


async function deletePayment(req, res) {
  const { id } = req.params;

  try {
    await prisma.payments.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting payment: " + error.message });
  }
}


async function getFullyPaidPayments(req, res) {
  try {

    const fullyPaidPayments = await prisma.payments.findMany({
      where: {
        amountPaid: {
          equals: prisma.payments.totalAmount,
        },
      },
      include: {
        student: true, 
      },
    });

    res.status(200).json(fullyPaidPayments);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching fully paid payments: " + error.message,
      });
  }
}

async function getUnderpaidPayments(req, res) {
  try {
  
    const underpaidPayments = await prisma.payments.findMany({
      where: {
        amountPaid: {
          lt: prisma.payments.totalAmount,
        },
      },
      include: {
        student: true, 
      },
    });

    res.status(200).json(underpaidPayments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching underpaid payments: " + error.message });
  }
}


async function getPaymentsByMonth(req, res) {
  const { month } = req.params;

  try {

    const payments = await prisma.payments.findMany({
      where: {
        month: month,
      },
      include: {
        student: true, 
      },
    });

    if (payments.length === 0) {
      return res
        .status(404)
        .json({ message: `No payments found for month ${month}` });
    }

    res.status(200).json(payments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching payments by month: " + error.message });
  }
}
async function getPaymentsByStudentId(req, res) {
  const { studentId } = req.params; 

  try {

    const payments = await prisma.payments.findMany({
      where: {
        studentId: parseInt(studentId, 10), 
      },
      include: {
        student: true
      },
    });

    if (payments.length === 0) {
      return res
        .status(404)
        .json({ message: `No payments found for student ID ${studentId}` });
    }

    res.status(200).json(payments);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching payments for student: " + error.message,
      });
  }
}
async function getPaidPaymentsByStudentId(req, res) {
  const { studentId } = req.params; 

  try {

    const payments = await prisma.payments.findMany({
      where: {
        studentId: parseInt(studentId, 10), 
        amountPaid: {
          equals: {
            totalAmount: true,
          },
        },
      },
      include: {
        student: true, 
      },
    });

    if (payments.length === 0) {
      return res
        .status(404)
        .json({
          message: `No paid payments found for student ID ${studentId}`,
        });
    }

    res.status(200).json(payments);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching paid payments for student: " + error.message,
      });
  }
}


async function getUnpaidPaymentsByStudentId(req, res) {
  const { studentId } = req.params; 

  try {

    const payments = await prisma.payments.findMany({
      where: {
        studentId: parseInt(studentId, 10), 
        amountPaid: {
          lt: {
            totalAmount: true,
          },
        },
      },
      include: {
        student: true, 
      },
    });

    if (payments.length === 0) {
      return res
        .status(404)
        .json({
          message: `No unpaid payments found for student ID ${studentId}`,
        });
    }

    res.status(200).json(payments);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching unpaid payments for student: " + error.message,
      });
  }
}

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getFullyPaidPayments,
  getUnderpaidPayments,
  getPaymentsByMonth,
  getPaymentsByStudentId,
  getPaidPaymentsByStudentId,
  getUnpaidPaymentsByStudentId
};
