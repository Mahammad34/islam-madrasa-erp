import {
    useEffect,
    useState
} from "react";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    updateDoc
} from "firebase/firestore";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function Tasks() {

  const [title,
    setTitle] =
    useState("");

  const [dueDate,
    setDueDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [priority,
    setPriority] =
    useState("Medium");

  const [search,
    setSearch] =
    useState("");

  const [tasks,
    setTasks] =
    useState([]);
      useEffect(() => {

    fetchTasks();

  }, []);
    const fetchTasks =
    async () => {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "tasks"
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

        setTasks(
          list.reverse()
        );

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      const addTask =
    async () => {

      if (!title) {

        alert(
          "Please enter task name"
        );

        return;

      }

      try {

        await addDoc(
          collection(
            db,
            "tasks"
          ),
          {
            title,
            dueDate,
            priority,
            completed:
              false,
            createdAt:
              Date.now()
          }
        );

        setTitle("");
        setPriority(
          "Medium"
        );

        fetchTasks();

        alert(
          "Task Added Successfully"
        );

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      const completeTask =
    async (id) => {

      try {

        await updateDoc(
          doc(
            db,
            "tasks",
            id
          ),
          {
            completed:
              true
          }
        );

        fetchTasks();

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      const deleteTask =
    async (id) => {

      try {

        await deleteDoc(
          doc(
            db,
            "tasks",
            id
          )
        );

        fetchTasks();

      }
      catch (error) {

        console.log(
          error
        );

      }

    };
      const totalTasks =
    tasks.length;

  const pendingTasks =
    tasks.filter(
      (item) =>
        !item.completed
    ).length;

  const completedTasks =
    tasks.filter(
      (item) =>
        item.completed
    ).length;

  const highPriorityTasks =
    tasks.filter(
      (item) =>
        item.priority ===
        "High"
    ).length;

  const filteredTasks =
    tasks.filter(
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
          📋 Tasks & Reminders
        </h1>

        <div className="attendance-summary">

          <div className="summary-card">

            <h2>
              {totalTasks}
            </h2>

            <p>
              Total Tasks
            </p>

          </div>

          <div className="summary-card">

            <h2>
              {pendingTasks}
            </h2>

            <p>
              Pending Tasks
            </p>

          </div>

          <div className="summary-card">

            <h2>
              {completedTasks}
            </h2>

            <p>
              Completed Tasks
            </p>

          </div>

          <div className="summary-card">

            <h2>
              {highPriorityTasks}
            </h2>

            <p>
              High Priority
            </p>

          </div>

        </div>

        <div className="module-card">

          <h2>
            Add New Task
          </h2>

          <input
            type="text"
            placeholder="Enter Task Name"
            className="attendance-search"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />

          <input
            type="date"
            className="attendance-search"
            value={dueDate}
            onChange={(e) =>
              setDueDate(
                e.target.value
              )
            }
          />

          <select
            className="attendance-search"
            value={priority}
            onChange={(e) =>
              setPriority(
                e.target.value
              )
            }
          >

            <option>
              Low
            </option>

            <option>
              Medium
            </option>

            <option>
              High
            </option>

          </select>

          <button
            className="save-all-btn"
            onClick={
              addTask
            }
          >
            ➕ Add Task
          </button>

        </div>

        <input
          type="text"
          placeholder="Search Tasks..."
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
                  Task
                </th>

                <th>
                  Due Date
                </th>

                <th>
                  Priority
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {
                filteredTasks.length ===
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
                        No Tasks Found
                      </td>

                    </tr>
                  )
                  : (
                    filteredTasks.map(
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
                              item.title
                            }
                          </td>

                          <td>
                            {
                              item.dueDate
                            }
                          </td>

                          <td>
                            {
                              item.priority
                            }
                          </td>

                          <td>

                            {
                              item.completed
                                ? "✅ Completed"
                                : "⏳ Pending"
                            }

                          </td>

                          <td>

                            {
                              !item.completed && (

                                <button
                                  onClick={() =>
                                    completeTask(
                                      item.id
                                    )
                                  }
                                  style={{
                                    marginRight:
                                      "10px"
                                  }}
                                >
                                  ✅ Complete
                                </button>

                              )
                            }

                            <button
                              onClick={() =>
                                deleteTask(
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

export default Tasks;