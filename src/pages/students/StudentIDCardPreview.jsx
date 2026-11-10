import "../../App.css";

function StudentIDCardPreview({
  studentName,
  studentId,
  fatherName,
  studentClass,
  bloodGroup,
  mobileNumber,
  photoUrl,
  qrCode,
  madrasaName = "MA MADRASA ERP",
  logoUrl = "",
  primaryColor = "#0B5D3B",
  secondaryColor = "#D4AF37"
}) {

  return (

    <div
      id="student-id-card"
      style={{
        width: "360px",
        margin: "auto",
        borderRadius: "20px",
        overflow: "hidden",
        background: "#ffffff",
        boxShadow:
          "0 15px 35px rgba(0,0,0,0.25)"
      }}
    >

      {/* HEADER */}

      <div
        style={{
          background:
            `linear-gradient(
              135deg,
              ${primaryColor},
              #1b5e20
            )`,
          color: "#ffffff",
          padding: "20px",
          textAlign: "center",
          borderBottom:
            `4px solid ${secondaryColor}`
        }}
      >

        {
          logoUrl ? (

            <img
              src={logoUrl}
              alt="Logo"
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                borderRadius: "50%",
                background: "#ffffff",
                padding: "5px"
              }}
            />

          ) : (

            <div
              style={{
                fontSize: "45px"
              }}
            >
              🕌
            </div>

          )
        }

        <h2
          style={{
            marginTop: "10px"
          }}
        >
          {madrasaName}
        </h2>

        <p>
          STUDENT ID CARD
        </p>

      </div>

      {/* BODY */}

      <div
        style={{
          padding: "25px",
          textAlign: "center"
        }}
      >

        {/* PHOTO */}

        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            overflow: "hidden",
            margin: "auto",
            border:
              `5px solid ${secondaryColor}`,
            background: "#eeeeee"
          }}
        >

          {
            photoUrl ? (

              <img
                src={photoUrl}
                alt="Student"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />

            ) : (

              <div
                style={{
                  fontSize: "55px",
                  paddingTop: "25px"
                }}
              >
                👦
              </div>

            )
          }

        </div>

        <br />

        <h2
          style={{
            color:
              primaryColor
          }}
        >
          {
            studentName ||
            "Student Name"
          }
        </h2>

        <hr />

        {/* DETAILS */}

        <div
          style={{
            textAlign: "left"
          }}
        >

          <p>
            <strong>
              🆔 Student ID :
            </strong>
            {" "}
            {
              studentId ||
              "-"
            }
          </p>

          <p>
            <strong>
              👨 Father :
            </strong>
            {" "}
            {
              fatherName ||
              "-"
            }
          </p>

          <p>
            <strong>
              📚 Class :
            </strong>
            {" "}
            {
              studentClass ||
              "-"
            }
          </p>

          <p>
            <strong>
              🩸 Blood Group :
            </strong>
            {" "}
            {
              bloodGroup ||
              "-"
            }
          </p>

          <p>
            <strong>
              📞 Mobile :
            </strong>
            {" "}
            {
              mobileNumber ||
              "-"
            }
          </p>

        </div>

        <br />

        {/* QR */}

        <div
          style={{
            width: "120px",
            height: "120px",
            margin: "auto",
            border:
              `2px solid ${secondaryColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            background:
              "#f7f7f7"
          }}
        >

          {
            qrCode ? (

              <img
                src={qrCode}
                alt="QR"
                style={{
                  width: "100px",
                  height: "100px"
                }}
              />

            ) : (

              <div>
                QR CODE
              </div>

            )
          }

        </div>

      </div>

      {/* FOOTER */}

      <div
        style={{
          background:
            secondaryColor,
          color: "#000000",
          padding: "12px",
          textAlign: "center",
          fontWeight: "bold"
        }}
      >

        If Found Please Return To
        <br />
        {madrasaName}

      </div>

    </div>

  );

}

export default StudentIDCardPreview;