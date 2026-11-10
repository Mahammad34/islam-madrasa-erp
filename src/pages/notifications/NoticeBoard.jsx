import {
    useEffect,
    useState
} from "react";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs
} from "firebase/firestore";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function NoticeBoard() {

  const [title,
    setTitle] =
    useState("");

  const [category,
    setCategory] =
    useState("General");

  const [date,
    setDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [important,
    setImportant] =
    useState(false);

  const [search,
    setSearch] =
    useState("");

  const [notices,
    setNotices] =
    useState([]);
      useEffect(() => {

    fetchNotices();

  }, []);
    const fetchNotices =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "notices"
            )
          );

        const list =
          [];

        snapshot.forEach(
          (doc) => {

            list.push({
              id:
                doc.id,
              ...doc.data()
            });

          }
        );

        setNotices(
          list.reverse()
        );

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      const addNotice =
    async () => {

      if (!title) {

        alert(
          "Please enter notice title"
        );

        return;

      }

      try {

        await addDoc(
          collection(
            db,
            "notices"
          ),
          {
            title,
            category,
            date,
            important,
            createdAt:
              Date.now()
          }
        );

        setTitle("");
        setCategory(
          "General"
        );
        setImportant(
          false
        );

        fetchNotices();

        alert(
          "Notice Added Successfully"
        );

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      const deleteNotice =
    async (id) => {

      try {

        await deleteDoc(
          doc(
            db,
            "notices",
            id
          )
        );

        fetchNotices();

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      const totalNotices =
    notices.length;

  const pinnedNotices =
    notices.filter(
      (item) =>
        item.important
    ).length;

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const todayNotices =
    notices.filter(
      (item) =>
        item.date ===
        today
    ).length;

  const filteredNotices =
    notices.filter(
      (item) =>
        item.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );
      return (
    <Layout>

      <div className="accounts-page">

        <h1>
          📢 Notice Board
        </h1>

        <div className="attendance-summary">

          <div className="summary-card">

            <h2>
              {totalNotices}
            </h2>

            <p>
              Total Notices
            </p>

          </div>

          <div className="summary-card">

            <h2>
              {pinnedNotices}
            </h2>

            <p>
              Pinned Notices
            </p>

          </div>

          <div className="summary-card">

            <h2>
              {todayNotices}
            </h2>

            <p>
              Today's Notices
            </p>

          </div>

          <div className="summary-card">

            <h2>
              ⚠️
            </h2>

            <p>
              Important Notices
            </p>

          </div>

        </div>

        <div className="module-card">

          <h2>
            Add New Notice
          </h2>

          <input
            type="text"
            placeholder="Enter Notice Title"
            className="attendance-search"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />

          <select
            className="attendance-search"
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          >

            <option>
              General
            </option>

            <option>
              Holiday
            </option>

            <option>
              Exam
            </option>

            <option>
              Meeting
            </option>

            <option>
              Event
            </option>

          </select>

          <input
            type="date"
            className="attendance-search"
            value={date}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
          />

          <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "15px",
    marginBottom: "15px"
  }}
>

  <input
    type="checkbox"
    checked={important}
    onChange={(e) =>
      setImportant(
        e.target.checked
      )
    }
    style={{
      width: "18px",
      height: "18px",
      cursor: "pointer"
    }}
  />

  <span>
    📌 Mark as Important
  </span>

</div>
          <button
            className="save-all-btn"
            onClick={
              addNotice
            }
          >
            ➕ Add Notice
          </button>

        </div>

        <input
          type="text"
          placeholder="Search Notices..."
          className="attendance-search"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <div
          className="attendance-table-container"
        >

          <table
            className="attendance-table"
          >

            <thead>

              <tr>

                <th>
                  Notice
                </th>

                <th>
                  Category
                </th>

                <th>
                  Date
                </th>

                <th>
                  Important
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {
                filteredNotices.length ===
                0
                  ? (
                    <tr>

                      <td
                        colSpan="5"
                        style={{
                          textAlign:
                            "center"
                        }}
                      >
                        No Notices Found
                      </td>

                    </tr>
                  )
                  : (
                    filteredNotices.map(
                      (
                        item
                      ) => (

                        <tr
                          key={
                            item.id
                          }
                        >

                          <td>

                            {
                              item.important
                                ? "📌 "
                                : ""
                            }

                            {
                              item.title
                            }

                          </td>

                          <td>
                            {
                              item.category
                            }
                          </td>

                          <td>
                            {
                              item.date
                            }
                          </td>

                          <td>

                            {
                              item.important
                                ? "Yes"
                                : "No"
                            }

                          </td>

                          <td>

                            <button
                              onClick={() =>
                                deleteNotice(
                                  item.id
                                )
                              }
                            >
                              🗑 Delete
                            </button>

                          </td>

                        </tr>

                      )
                    )
                  )
              }

            </tbody>

          </table>

        </div>

      </div>

    </Layout>
  );

}

export default NoticeBoard;