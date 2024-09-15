// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Scheduled function to run every minute
exports.deleteReviewedReports = functions.pubsub
    .schedule("every 1 minutes")
    .onRun(async (context) => {
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();

      try {
        const reportsRef = db.collection("reports");
        const querySnapshot = await reportsRef
            .where("status", "==", "reviewed")
            .where("deletedAt", "<=", now)
            .get();

        if (querySnapshot.empty) {
          console.log("No reports to delete at this time.");
          return null;
        }

        const batch = db.batch();
        querySnapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
          console.log(`Deleting report with ID: ${docSnap.id}`);
        });

        await batch.commit();
        console.log("All eligible reviewed reports deleted successfully.");
      } catch (error) {
        console.error("Error deleting reviewed reports:", error);
      }

      return null;
    });
