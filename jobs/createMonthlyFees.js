const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkAndCreatePaymentsForCurrentMonth() {
  try {
    // Fetch all students with their payments and subjects
    const students = await prisma.students.findMany({
      include: {
        payments: {
          orderBy: { createdAt: "desc" }, // Order payments by createdAt in descending order
        },
        subjects: true,
      },
    });

    // Get the current date
    const now = new Date();

    for (const student of students) {
      // Get the latest payment for the student based on createdAt
      const latestPayment = student.payments[0]; // Since payments are ordered by createdAt, the first one is the latest

      if (latestPayment) {
        // Check if the due date of the latest payment is before the current date
        if (latestPayment.dueDate < now) {
          // Calculate the next payment due date (30 days after the last payment's due date)
          const nextDueDate = new Date(latestPayment.dueDate);
          nextDueDate.setDate(nextDueDate.getDate() + 31);

          // Calculate the month for the next payment
          const nextPaymentMonth = nextDueDate.toLocaleString("default", {
            month: "long",
          });

          // Check if a payment already exists for the next month
          const existingPayment = student.payments.find(
            (payment) =>
              new Date(payment.dueDate).toLocaleString("default", {
                month: "long",
              }) === nextPaymentMonth
          );

          if (!existingPayment) {
            // Calculate total amount and discount based on the student's subjects
            const totalSubjects = student.subjects.length;
            const totalAmount = student.subjects.reduce(
              (sum, subject) => sum + subject.pricePerMonth,
              0
            );
            const discount = totalSubjects > 1 ? 50 * totalSubjects : 0;
            const finalAmount = totalAmount - discount;

            // Create a new payment entry
            await prisma.payments.create({
              data: {
                studentId: student.id,
                month: nextPaymentMonth,
                totalAmount: finalAmount,
                amountPaid: 0,
                amountDue: finalAmount,
                discount: discount,
                dueDate: nextDueDate,
              },
            });

            console.log(
              `Created new payment for student ${student.id} for month ${nextPaymentMonth}`
            );
          } else {
            //create new one
            console.log(
              `Payment already exists for student ${student.id} for month ${nextPaymentMonth}`
            );
          }
        }
      } else {
        // Calculate total amount and discount based on the student's subjects
        const totalSubjects = student.subjects.length;
        const totalAmount = student.subjects.reduce(
          (sum, subject) => sum + subject.pricePerMonth,
          0
        );
        const discount = totalSubjects > 1 ? 50 * totalSubjects : 0;
        const finalAmount = totalAmount - discount;

        // Set the due date for the first payment to be 30 days from the registrationDate
        const firstDueDate = new Date(student.registrationDate);
        firstDueDate.setDate(firstDueDate.getDate() + 30);

        // Calculate the month for the first payment
        const firstPaymentMonth = firstDueDate.toLocaleString("default", {
          month: "long",
        });

        // Create the first payment entry
        await prisma.payments.create({
          data: {
            studentId: student.id,
            month: firstPaymentMonth,
            totalAmount: finalAmount,
            amountPaid: 0,
            amountDue: finalAmount,
            discount: discount,
            dueDate: firstDueDate,
          },
        });

        console.log(
          `Created first payment for student ${student.id} for month ${firstPaymentMonth}`
        );
      }
    }

    console.log("Payments checked and created for the current month");
  } catch (error) {
    console.error("Error while checking and creating payments:", error);
  }
}

//  the job to run every day at 00:00 (midnight)
cron.schedule("* * * * *", checkAndCreatePaymentsForCurrentMonth);
