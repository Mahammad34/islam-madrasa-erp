import {
    collection,
    getDocs
} from "firebase/firestore";
import { useState } from "react";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function BackupRestore() {

  const [backupDate,
    setBackupDate] =
    useState("");

  const [backupCount,
    setBackupCount] =
    useState(0);
      const collections = [
    "students",
    "staff",
    "parents",
    "income",
    "expenses",
    "donations",
    "tasks",
    "notices",
    "settings"
  ];
    const backupData =
    async () => {

      try {

        const backup = {};

        let total = 0;

        for (
          const collectionName
          of collections
        ) {

          const snapshot =
            await getDocs(
              collection(
                db,
                collectionName
              )
            );

          const list = [];

          snapshot.forEach(
            (doc) => {

              list.push({
                id:
                  doc.id,
                ...doc.data()
              });

            }
          );

          backup[
            collectionName
          ] = list;

          total +=
            list.length;

        }

        const data =
          JSON.stringify(
            backup,
            null,
            2
          );

        const blob =
          new Blob(
            [data],
            {
              type:
                "application/json"
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          url;

        link.download =
          `madrasa-backup-${Date.now()}.json`;

        link.click();

        setBackupDate(
          new Date()
            .toLocaleString()
        );

        setBackupCount(
          total
        );

        alert(
          "Backup Downloaded Successfully"
        );

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      const restoreData =
    () => {

      alert(
        "Restore Module Coming Next"
      );

    };
      return (
    <Layout>

      <div className="accounts-page">

        <h1>
          💾 Backup & Restore
        </h1>

        <div className="attendance-summary">

          <div className="summary-card">

            <h2>
              {backupCount}
            </h2>

            <p>
              Total Records
            </p>

          </div>

          <div className="summary-card">

            <h2>
              {
                backupDate
                  ? "✅"
                  : "⚠️"
              }
            </h2>

            <p>
              {
                backupDate
                  ? "Backup Created"
                  : "No Backup Yet"
              }
            </p>

          </div>

          <div className="summary-card">

            <h2>
              📥
            </h2>

            <p>
              Download Backup
            </p>

          </div>

          <div className="summary-card">

            <h2>
              📤
            </h2>

            <p>
              Restore Data
            </p>

          </div>

        </div>

        <div className="module-card">

          <h2>
            Database Backup
          </h2>

          <p
            style={{
              marginBottom:
                "20px"
            }}
          >
            Download all madrasa
            data into a JSON
            backup file.
          </p>

          <button
            className="save-all-btn"
            onClick={
              backupData
            }
          >
            📥 Download Backup
          </button>

        </div>

        <div
          className="module-card"
          style={{
            marginTop:
              "30px"
          }}
        >

          <h2>
            Database Restore
          </h2>

          <p
            style={{
              marginBottom:
                "20px"
            }}
          >
            Restore madrasa data
            from a backup file.
          </p>

          <button
            className="save-all-btn"
            onClick={
              restoreData
            }
          >
            📤 Restore Backup
          </button>

        </div>

        <div
          className="section-card"
          style={{
            marginTop:
              "30px"
          }}
        >

          <h2>
            Backup Information
          </h2>

          <p>
            Last Backup:
            {" "}
            {
              backupDate ||
              "Not Available"
            }
          </p>

          <p>
            Records Backed Up:
            {" "}
            {
              backupCount
            }
          </p>

          <p>
            File Format:
            JSON
          </p>

        </div>

      </div>

    </Layout>
  );

}

export default BackupRestore;