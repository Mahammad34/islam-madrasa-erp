import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";

import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import "../../App.css";
import Layout from "../../components/Layout";
import { db } from "../../firebase";

function GenerateIDCard() {
  const madrasaId =
  localStorage.getItem(
    "madrasaId"
  );

  // ============================================================
  // REFERENCES
  // ============================================================

  const cardRef = useRef(null);

  const isMountedRef = useRef(true);


  // ============================================================
  // STUDENT DATA STATES
  // ============================================================

  const [
    students,
    setStudents
  ] = useState([]);


  const [
    studentsLoading,
    setStudentsLoading
  ] = useState(true);


  const [
    studentsError,
    setStudentsError
  ] = useState("");


  const [
    selectedStudentDocId,
    setSelectedStudentDocId
  ] = useState("");


  const [
    studentName,
    setStudentName
  ] = useState("");


  const [
    studentId,
    setStudentId
  ] = useState("");


  const [
    fatherName,
    setFatherName
  ] = useState("");


  const [
    mobileNumber,
    setMobileNumber
  ] = useState("");


  const [
    studentClass,
    setStudentClass
  ] = useState("");


  const [
    bloodGroup,
    setBloodGroup
  ] = useState("");


  const [
    address,
    setAddress
  ] = useState("");


  const [
    photoUrl,
    setPhotoUrl
  ] = useState("");


  // ============================================================
  // EXTRA STUDENT INFORMATION
  // ============================================================

  const [
    admissionNumber,
    setAdmissionNumber
  ] = useState("");


  const [
    dateOfBirth,
    setDateOfBirth
  ] = useState("");


  const [
    emergencyContact,
    setEmergencyContact
  ] = useState("");


  const [
    academicYear,
    setAcademicYear
  ] = useState("2026-2027");


  // ============================================================
  // CARD STATES
  // ============================================================

  const [
    cardNumber,
    setCardNumber
  ] = useState("");


  const [
    cardTheme,
    setCardTheme
  ] = useState("Makkah");


  const [
    cardStatus,
    setCardStatus
  ] = useState("Active");


  const [
    issueDate,
    setIssueDate
  ] = useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );


  const [
    expiryDate,
    setExpiryDate
  ] = useState("");


  const [
    cardVersion,
    setCardVersion
  ] = useState(1);


  const [
    isReissued,
    setIsReissued
  ] = useState(false);


  // ============================================================
  // MADRASA / CARD DISPLAY STATES
  // ============================================================

  const [
    madrasaName,
    setMadrasaName
  ] = useState("MA MADRASA ERP");


  const [
    madrasaSubtitle,
    setMadrasaSubtitle
  ] = useState("Student Identity Card");


  const [
    madrasaMobile,
    setMadrasaMobile
  ] = useState("");


  const [
    madrasaAddress,
    setMadrasaAddress
  ] = useState("");


  const [
    madrasaLogo,
    setMadrasaLogo
  ] = useState("");


  // ============================================================
  // UI STATES
  // ============================================================

  const [
    isSaving,
    setIsSaving
  ] = useState(false);


  const [
    isDownloadingPNG,
    setIsDownloadingPNG
  ] = useState(false);


  const [
    isDownloadingPDF,
    setIsDownloadingPDF
  ] = useState(false);


  const [
    isPrinting,
    setIsPrinting
  ] = useState(false);


  const [
    generatedSuccessfully,
    setGeneratedSuccessfully
  ] = useState(false);


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  // ============================================================
  // THEME CONFIGURATION
  // ============================================================

  const themeConfig = useMemo(
    () => {

      const themes = {

        Makkah: {
          primary:
            "#076b55",

          secondary:
            "#0f8f78",

          accent:
            "#d4af37",

          background:
            "#ffffff",

          text:
            "#1e293b",

          mutedText:
            "#64748b",

          headerGradient:
            "linear-gradient(135deg, #075e4b 0%, #0d7a60 55%, #14532d 100%)"
        },


        "Green Gold": {
          primary:
            "#14532d",

          secondary:
            "#166534",

          accent:
            "#d4af37",

          background:
            "#fffdf5",

          text:
            "#17251c",

          mutedText:
            "#66756c",

          headerGradient:
            "linear-gradient(135deg, #14532d 0%, #166534 60%, #92711c 100%)"
        },


        "Blue Premium": {
          primary:
            "#123b6d",

          secondary:
            "#1d5d9b",

          accent:
            "#d6b35a",

          background:
            "#f8fbff",

          text:
            "#172033",

          mutedText:
            "#64748b",

          headerGradient:
            "linear-gradient(135deg, #102a43 0%, #185a9d 60%, #1d4e89 100%)"
        }

      };


      return (
        themes[cardTheme] ||
        themes.Makkah
      );

    },
    [
      cardTheme
    ]
  );


  // ============================================================
  // CLEANUP
  // ============================================================

  useEffect(
    () => {

      isMountedRef.current =
        true;


      return () => {

        isMountedRef.current =
          false;

      };

    },
    []
  );


  // ============================================================
  // FETCH STUDENTS
  // ============================================================

  const fetchStudents =
    useCallback(
      async () => {

        setStudentsLoading(
          true
        );

        setStudentsError(
          ""
        );


        try {

          if (!madrasaId) {

  setStudents([]);

  setStudentsError(
    "Madrasa account not found."
  );

  setStudentsLoading(
    false
  );

  return;

}


const studentsQuery =
  query(
    collection(
      db,
      "students"
    ),
    where(
      "madrasaId",
      "==",
      madrasaId
    )
  );


const studentsSnapshot =
  await getDocs(
    studentsQuery
  );


          const studentList =
            studentsSnapshot.docs.map(
              (
                studentDocument
              ) => {

                return {

                  id:
                    studentDocument.id,

                  ...studentDocument.data()

                };

              }
            );


          studentList.sort(
            (
              firstStudent,
              secondStudent
            ) => {

              const firstName =
                (
                  firstStudent.studentName ||
                  ""
                ).toLowerCase();


              const secondName =
                (
                  secondStudent.studentName ||
                  ""
                ).toLowerCase();


              return firstName.localeCompare(
                secondName
              );

            }
          );


          if (
            isMountedRef.current
          ) {

            setStudents(
              studentList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error fetching students:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setStudentsError(
              "Unable to load students. Please try again."
            );

          }

        }
        finally {

          if (
            isMountedRef.current
          ) {

            setStudentsLoading(
              false
            );

          }

        }

      },
[
  madrasaId
]
);


  // ============================================================
  // LOAD STUDENTS ON PAGE OPEN
  // ============================================================

  useEffect(
    () => {

      fetchStudents();

    },
    [
      fetchStudents
    ]
  );


  // ============================================================
  // RESET STUDENT DETAILS
  // ============================================================

  const clearStudentDetails =
    () => {

      setSelectedStudentDocId(
        ""
      );

      setStudentName(
        ""
      );

      setStudentId(
        ""
      );

      setFatherName(
        ""
      );

      setMobileNumber(
        ""
      );

      setStudentClass(
        ""
      );

      setBloodGroup(
        ""
      );

      setAddress(
        ""
      );

      setPhotoUrl(
        ""
      );

      setAdmissionNumber(
        ""
      );

      setDateOfBirth(
        ""
      );

      setEmergencyContact(
        ""
      );

      setCardNumber(
        ""
      );

      setCardVersion(
        1
      );

      setIsReissued(
        false
      );

      setGeneratedSuccessfully(
        false
      );

      setSuccessMessage(
        ""
      );

      setErrorMessage(
        ""
      );

    };


  // ============================================================
  // HANDLE STUDENT SELECTION
  // ============================================================

  const handleStudentChange =
    (
      selectedDocumentId
    ) => {

      setSuccessMessage(
        ""
      );

      setErrorMessage(
        ""
      );

      setGeneratedSuccessfully(
        false
      );

      setCardNumber(
        ""
      );


      if (
        !selectedDocumentId
      ) {

        clearStudentDetails();

        return;

      }


      const selectedStudent =
        students.find(
          (
            student
          ) =>
            student.id ===
            selectedDocumentId
        );


      if (
        !selectedStudent
      ) {

        clearStudentDetails();

        setErrorMessage(
          "Selected student could not be found."
        );

        return;

      }


      setSelectedStudentDocId(
        selectedStudent.id
      );


      setStudentName(
        selectedStudent.studentName ||
        selectedStudent.fullName ||
        selectedStudent.name ||
        ""
      );


      setStudentId(
        selectedStudent.studentId ||
        selectedStudent.studentID ||
        ""
      );


      setFatherName(
        selectedStudent.fatherName ||
        selectedStudent.parentName ||
        ""
      );


      setMobileNumber(
        selectedStudent.mobileNumber ||
        selectedStudent.mobile ||
        selectedStudent.phone ||
        ""
      );


      setStudentClass(
        selectedStudent.studentClass ||
        selectedStudent.className ||
        selectedStudent.class ||
        ""
      );


      setBloodGroup(
        selectedStudent.bloodGroup ||
        ""
      );


      setAddress(
        selectedStudent.address ||
        ""
      );


      setPhotoUrl(
        selectedStudent.profilePhoto ||
        selectedStudent.photoUrl ||
        selectedStudent.photo ||
        ""
      );


      setAdmissionNumber(
        selectedStudent.admissionNumber ||
        selectedStudent.admissionNo ||
        ""
      );


      setDateOfBirth(
        selectedStudent.dateOfBirth ||
        selectedStudent.dob ||
        ""
      );


      setEmergencyContact(
        selectedStudent.emergencyContact ||
        selectedStudent.parentMobile ||
        ""
      );

    };


  // ============================================================
  // QR CODE PREVIEW DATA
  // ============================================================

  const qrValue = useMemo(
    () => {

      return JSON.stringify(
        {

          type:
            "STUDENT_ID_CARD",

          cardNumber:
            cardNumber ||
            "PREVIEW",

          studentId:
            studentId ||
            "",

          studentName:
            studentName ||
            "",

          studentClass:
            studentClass ||
            "",

          bloodGroup:
            bloodGroup ||
            "",

          academicYear:
            academicYear ||
            "",

          status:
            cardStatus

        }
      );

    },
    [
      cardNumber,
      studentId,
      studentName,
      studentClass,
      bloodGroup,
      academicYear,
      cardStatus
    ]
  );
    // ============================================================
  // GENERATE UNIQUE CARD NUMBER
  // ============================================================

  const createUniqueCardNumber =
    async () => {

      const year =
        new Date()
          .getFullYear();


      let uniqueCardNumber =
        "";


      let cardNumberExists =
        true;


      let attempts =
        0;


      while (
        cardNumberExists &&
        attempts < 10
      ) {

        attempts += 1;


        const randomPart =
          Math.floor(
            100000 +
            Math.random() *
            900000
          );


        uniqueCardNumber =
          `SID-${year}-${randomPart}`;


        const cardNumberQuery =
          query(
            collection(
              db,
              "studentIdCards"
            ),
            where(
              "cardNumber",
              "==",
              uniqueCardNumber
            )
          );


        const existingCardsSnapshot =
          await getDocs(
            cardNumberQuery
          );


        cardNumberExists =
          !existingCardsSnapshot.empty;

      }


      if (
        cardNumberExists
      ) {

        throw new Error(
          "Unable to generate a unique card number."
        );

      }


      return uniqueCardNumber;

    };


  // ============================================================
  // VALIDATE CARD FORM
  // ============================================================

  const validateCardForm =
    () => {

      if (
        !selectedStudentDocId
      ) {

        setErrorMessage(
          "Please select a student."
        );

        return false;

      }


      if (
        !studentName.trim()
      ) {

        setErrorMessage(
          "Student name is missing."
        );

        return false;

      }


      if (
        !studentId.trim()
      ) {

        setErrorMessage(
          "Student ID is missing."
        );

        return false;

      }


      if (
        !issueDate
      ) {

        setErrorMessage(
          "Please select the card issue date."
        );

        return false;

      }


      if (
        expiryDate &&
        expiryDate < issueDate
      ) {

        setErrorMessage(
          "Expiry date cannot be before issue date."
        );

        return false;

      }


      if (
        !academicYear.trim()
      ) {

        setErrorMessage(
          "Please enter the academic year."
        );

        return false;

      }


      setErrorMessage(
        ""
      );


      return true;

    };


  // ============================================================
  // GET PREVIOUS STUDENT CARDS
  // ============================================================

  const getPreviousStudentCards =
    async () => {

      const previousCardsQuery =
  query(
    collection(
      db,
      "studentIdCards"
    ),
    where(
      "madrasaId",
      "==",
      madrasaId
    ),
    where(
      "studentDocId",
      "==",
      selectedStudentDocId
    )
  );


      const previousCardsSnapshot =
        await getDocs(
          previousCardsQuery
        );


      return previousCardsSnapshot.docs.map(
        (
          cardDocument
        ) => ({

          id:
            cardDocument.id,

          ...cardDocument.data()

        })
      );

    };


  // ============================================================
  // CALCULATE NEXT CARD VERSION
  // ============================================================

  const calculateNextCardVersion =
    (
      previousCards
    ) => {

      if (
        previousCards.length === 0
      ) {

        return 1;

      }


      const versions =
        previousCards.map(
          (
            card
          ) =>
            Number(
              card.cardVersion
            ) || 1
        );


      const highestVersion =
        Math.max(
          ...versions
        );


      return (
        highestVersion + 1
      );

    };


  // ============================================================
  // GENERATE AND SAVE ID CARD
  // ============================================================

  const generateAndSaveIDCard =
    async () => {

      if (
        isSaving
      ) {

        return;

      }


      const isFormValid =
        validateCardForm();


      if (
        !isFormValid
      ) {

        return;

      }


      setIsSaving(
        true
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      try {

        // ======================================================
        // CHECK PREVIOUS CARDS
        // ======================================================

        const previousCards =
          await getPreviousStudentCards();


        const nextCardVersion =
          calculateNextCardVersion(
            previousCards
          );


        const reissueStatus =
          previousCards.length > 0;


        // ======================================================
        // GENERATE UNIQUE CARD NUMBER
        // ======================================================

        const newCardNumber =
          await createUniqueCardNumber();


        // ======================================================
        // CREATE FINAL QR DATA
        // ======================================================

        const finalQrData =
          JSON.stringify(
            {

              type:
                "STUDENT_ID_CARD",

              cardNumber:
                newCardNumber,

              studentId,

              studentName,

              studentClass,

              bloodGroup,

              academicYear,

              cardVersion:
                nextCardVersion,

              status:
                cardStatus

            }
          );


        // ======================================================
        // CREATE FIRESTORE DOCUMENT
        // ======================================================

        const cardData = {

          madrasaId,
        
          // ====================================================
          // CARD TYPE
          // ====================================================

          cardType:
            "Student",


          // ====================================================
          // RELATIONSHIP DATA
          // ====================================================

          studentDocId:
            selectedStudentDocId,

          studentId,

          admissionNumber,


          // ====================================================
          // STUDENT INFORMATION
          // ====================================================

          studentName,

          fatherName,

          mobileNumber,

          studentClass,

          bloodGroup,

          address,

          photoUrl,

          dateOfBirth,

          emergencyContact,


          // ====================================================
          // CARD INFORMATION
          // ====================================================

          cardNumber:
            newCardNumber,

          cardVersion:
            nextCardVersion,

          cardTheme,

          cardStatus,

          issueDate,

          expiryDate,

          academicYear,


          // ====================================================
          // REISSUE INFORMATION
          // ====================================================

          isReissued:
            reissueStatus,

          isLost:
            false,

          isDamaged:
            false,

          previousCardCount:
            previousCards.length,


          // ====================================================
          // QR INFORMATION
          // ====================================================

          qrData:
            finalQrData,


          // ====================================================
          // MADRASA INFORMATION SNAPSHOT
          // ====================================================

          madrasaName,

          madrasaSubtitle,

          madrasaMobile,

          madrasaAddress,

          madrasaLogo,


          // ====================================================
          // THEME SNAPSHOT
          // ====================================================

          themeSnapshot: {

            themeName:
              cardTheme,

            primaryColor:
              themeConfig.primary,

            secondaryColor:
              themeConfig.secondary,

            accentColor:
              themeConfig.accent,

            backgroundColor:
              themeConfig.background,

            textColor:
              themeConfig.text

          },


          // ====================================================
          // FUTURE FILE INFORMATION
          // ====================================================

          pngUrl:
            "",

          pdfUrl:
            "",


          // ====================================================
          // TRACKING
          // ====================================================

          printCount:
            0,

          downloadCount:
            0,


          // ====================================================
          // FUTURE WORKFLOW
          // ====================================================

          approved:
            true,

          approvedBy:
            "",

          notes:
            "",


          // ====================================================
          // TIMESTAMPS
          // ====================================================

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()

        };


        // ======================================================
        // SAVE FIRESTORE DOCUMENT
        // ======================================================

        await addDoc(
          collection(
            db,
            "studentIdCards"
          ),
          cardData
        );


        // ======================================================
        // UPDATE UI
        // ======================================================

        if (
          isMountedRef.current
        ) {

          setCardNumber(
            newCardNumber
          );


          setCardVersion(
            nextCardVersion
          );


          setIsReissued(
            reissueStatus
          );


          setGeneratedSuccessfully(
            true
          );


          setSuccessMessage(
            reissueStatus
              ?
              `ID Card Reissued Successfully. Card Number: ${newCardNumber}`
              :
              `ID Card Generated Successfully. Card Number: ${newCardNumber}`
          );

        }

      }
      catch (
        error
      ) {

        console.error(
          "Error generating ID card:",
          error
        );


        if (
          isMountedRef.current
        ) {

          setErrorMessage(
            error.message ||
            "Unable to generate the ID card. Please try again."
          );

        }

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsSaving(
            false
          );

        }

      }

    };


  // ============================================================
  // GENERATE ANOTHER CARD
  // ============================================================

  const generateAnotherCard =
    () => {

      clearStudentDetails();


      setIssueDate(
        new Date()
          .toISOString()
          .split("T")[0]
      );


      setExpiryDate(
        ""
      );


      setCardStatus(
        "Active"
      );


      setCardTheme(
        "Makkah"
      );


      setCardVersion(
        1
      );


      setIsReissued(
        false
      );


      window.scrollTo(
        {
          top:
            0,

          behavior:
            "smooth"
        }
      );

    };


  // ============================================================
  // SAFE FILE NAME
  // ============================================================

  const createSafeFileName =
    () => {

      const safeStudentName =
        (
          studentName ||
          "Student"
        )
          .trim()
          .replace(
            /[^a-zA-Z0-9-_ ]/g,
            ""
          )
          .replace(
            /\s+/g,
            "-"
          );


      const safeStudentId =
        (
          studentId ||
          Date.now().toString()
        )
          .trim()
          .replace(
            /[^a-zA-Z0-9-_]/g,
            ""
          );


      return (
        `${safeStudentName}-${safeStudentId}`
      );

    };


  // ============================================================
  // CAPTURE CARD AS CANVAS
  // ============================================================

  const captureCardAsCanvas =
    async () => {

      const cardElement =
        cardRef.current;


      if (
        !cardElement
      ) {

        throw new Error(
          "ID card preview could not be found."
        );

      }


      const canvas =
        await html2canvas(
          cardElement,
          {

            scale:
              3,

            useCORS:
              true,

            allowTaint:
              false,

            backgroundColor:
              themeConfig.background,

            logging:
              false

          }
        );


      return canvas;

    };
      // ============================================================
  // VALIDATE CARD BEFORE EXPORT
  // ============================================================

  const validateCardForExport =
    () => {

      if (
        !selectedStudentDocId
      ) {

        setErrorMessage(
          "Please select a student before downloading or printing."
        );

        return false;

      }


      if (
        !studentName ||
        !studentId
      ) {

        setErrorMessage(
          "Student information is incomplete."
        );

        return false;

      }


      setErrorMessage(
        ""
      );


      return true;

    };


  // ============================================================
  // DOWNLOAD PNG
  // ============================================================

  const downloadPNG =
    async () => {

      if (
        isDownloadingPNG
      ) {

        return;

      }


      const isValid =
        validateCardForExport();


      if (
        !isValid
      ) {

        return;

      }


      setIsDownloadingPNG(
        true
      );


      setErrorMessage(
        ""
      );


      try {

        const canvas =
          await captureCardAsCanvas();


        const imageData =
          canvas.toDataURL(
            "image/png",
            1.0
          );


        const downloadLink =
          document.createElement(
            "a"
          );


        downloadLink.href =
          imageData;


        downloadLink.download =
          `${createSafeFileName()}.png`;


        document.body.appendChild(
          downloadLink
        );


        downloadLink.click();


        document.body.removeChild(
          downloadLink
        );


        setSuccessMessage(
          "ID Card PNG downloaded successfully."
        );

      }
      catch (
        error
      ) {

        console.error(
          "PNG download error:",
          error
        );


        setErrorMessage(
          "Unable to download PNG. Please try again."
        );

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsDownloadingPNG(
            false
          );

        }

      }

    };


  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

  const downloadPDF =
    async () => {

      if (
        isDownloadingPDF
      ) {

        return;

      }


      const isValid =
        validateCardForExport();


      if (
        !isValid
      ) {

        return;

      }


      setIsDownloadingPDF(
        true
      );


      setErrorMessage(
        ""
      );


      try {

        const canvas =
          await captureCardAsCanvas();


        const imageData =
          canvas.toDataURL(
            "image/png",
            1.0
          );


        // ======================================================
        // CARD SIZE
        //
        // Standard CR80 ID Card:
        // 85.60 mm × 53.98 mm
        //
        // Our current design is portrait,
        // so width and height are reversed.
        // ======================================================

        const cardWidth =
          53.98;


        const cardHeight =
          85.6;


        const pdf =
          new jsPDF(
            {

              orientation:
                "portrait",

              unit:
                "mm",

              format: [
                cardWidth,
                cardHeight
              ]

            }
          );


        pdf.addImage(
          imageData,
          "PNG",
          0,
          0,
          cardWidth,
          cardHeight
        );


        pdf.save(
          `${createSafeFileName()}.pdf`
        );


        setSuccessMessage(
          "ID Card PDF downloaded successfully."
        );

      }
      catch (
        error
      ) {

        console.error(
          "PDF download error:",
          error
        );


        setErrorMessage(
          "Unable to download PDF. Please try again."
        );

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsDownloadingPDF(
            false
          );

        }

      }

    };


  // ============================================================
  // PRINT ID CARD
  // ============================================================

  const printCard =
    async () => {

      if (
        isPrinting
      ) {

        return;

      }


      const isValid =
        validateCardForExport();


      if (
        !isValid
      ) {

        return;

      }


      setIsPrinting(
        true
      );


      setErrorMessage(
        ""
      );


      try {

        // ======================================================
        // CAPTURE CARD FIRST
        //
        // Printing the captured image is more reliable than
        // copying card HTML into a new window.
        // ======================================================

        const canvas =
          await captureCardAsCanvas();


        const imageData =
          canvas.toDataURL(
            "image/png",
            1.0
          );


        const printWindow =
          window.open(
            "",
            "_blank",
            "width=900,height=1000"
          );


        if (
          !printWindow
        ) {

          throw new Error(
            "Print window was blocked by the browser."
          );

        }


        printWindow.document.open();


        printWindow.document.write(
          `
            <!DOCTYPE html>

            <html>

              <head>

                <meta charset="UTF-8" />

                <title>
                  ${createSafeFileName()}
                </title>

                <style>

                  @page {

                    size:
                      53.98mm
                      85.60mm;

                    margin:
                      0;

                  }


                  * {

                    box-sizing:
                      border-box;

                  }


                  html,
                  body {

                    width:
                      53.98mm;

                    height:
                      85.60mm;

                    margin:
                      0;

                    padding:
                      0;

                    background:
                      #ffffff;

                  }


                  body {

                    display:
                      flex;

                    align-items:
                      center;

                    justify-content:
                      center;

                    overflow:
                      hidden;

                  }


                  img {

                    display:
                      block;

                    width:
                      53.98mm;

                    height:
                      85.60mm;

                    object-fit:
                      fill;

                  }

                </style>

              </head>


              <body>

                <img
                  id="print-card-image"
                  src="${imageData}"
                  alt="Student ID Card"
                />

              </body>

            </html>
          `
        );


        printWindow.document.close();


        const printImage =
          printWindow.document.getElementById(
            "print-card-image"
          );


        const startPrint =
          () => {

            printWindow.focus();


            printWindow.print();


            setTimeout(
              () => {

                printWindow.close();

              },
              500
            );

          };


        if (
          printImage.complete
        ) {

          setTimeout(
            startPrint,
            300
          );

        }
        else {

          printImage.onload =
            () => {

              setTimeout(
                startPrint,
                300
              );

            };

        }


        setSuccessMessage(
          "ID Card is ready for printing."
        );

      }
      catch (
        error
      ) {

        console.error(
          "Print error:",
          error
        );


        setErrorMessage(
          error.message ||
          "Unable to print the ID card."
        );

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsPrinting(
            false
          );

        }

      }

    };


  // ============================================================
  // FORMAT DISPLAY DATE
  // ============================================================

  const formatDisplayDate =
    (
      dateValue
    ) => {

      if (
        !dateValue
      ) {

        return "-";

      }


      const date =
        new Date(
          `${dateValue}T00:00:00`
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return dateValue;

      }


      return date.toLocaleDateString(
        "en-IN",
        {

          day:
            "2-digit",

          month:
            "short",

          year:
            "numeric"

        }
      );

    };


  // ============================================================
  // DISPLAY FALLBACK
  // ============================================================

  const displayValue =
    (
      value,
      fallback = "-"
    ) => {

      if (
        value === null ||
        value === undefined ||
        String(
          value
        ).trim() ===
          ""
      ) {

        return fallback;

      }


      return value;

    };


  // ============================================================
  // STUDENT INITIALS
  // ============================================================

  const studentInitials =
    useMemo(
      () => {

        if (
          !studentName.trim()
        ) {

          return "ST";

        }


        const nameParts =
          studentName
            .trim()
            .split(
              /\s+/
            );


        if (
          nameParts.length === 1
        ) {

          return nameParts[0]
            .slice(
              0,
              2
            )
            .toUpperCase();

        }


        return (
          `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        ).toUpperCase();

      },
      [
        studentName
      ]
    );


  // ============================================================
  // CARD STATUS COLOR
  // ============================================================

  const cardStatusColor =
    useMemo(
      () => {

        const statusColors = {

          Active:
            "#15803d",

          Inactive:
            "#64748b",

          Expired:
            "#b45309",

          Lost:
            "#dc2626",

          Reissued:
            "#7c3aed"

        };


        return (
          statusColors[cardStatus] ||
          "#15803d"
        );

      },
      [
        cardStatus
      ]
    );


  // ============================================================
  // CAN DOWNLOAD / PRINT
  // ============================================================

  const canExportCard =
    Boolean(
      selectedStudentDocId &&
      studentName &&
      studentId
    );
      // ============================================================
  // PAGE UI
  // ============================================================

  return (

    <Layout>

      <div className="accounts-page">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap:
              "16px",

            flexWrap:
              "wrap",

            marginBottom:
              "24px"
          }}
        >

          <div>

            <h1
              style={{
                margin:
                  "0 0 6px 0"
              }}
            >
              🪪 Generate Student ID Card
            </h1>

            <p
              style={{
                margin:
                  0,

                color:
                  "#64748b"
              }}
            >
              Create, preview, save, download and print student identity cards.
            </p>

          </div>


          <button
            type="button"
            onClick={
              fetchStudents
            }
            disabled={
              studentsLoading
            }
          >
            {
              studentsLoading
                ?
                "⏳ Loading..."
                :
                "🔄 Refresh Students"
            }
          </button>

        </div>


        {/* ======================================================
            SUCCESS MESSAGE
        ====================================================== */}

        {
          successMessage && (

            <div
              style={{
                padding:
                  "14px 16px",

                marginBottom:
                  "18px",

                borderRadius:
                  "10px",

                background:
                  "#ecfdf5",

                border:
                  "1px solid #86efac",

                color:
                  "#166534",

                fontWeight:
                  "600"
              }}
            >
              ✅ {successMessage}
            </div>

          )
        }


        {/* ======================================================
            ERROR MESSAGE
        ====================================================== */}

        {
          errorMessage && (

            <div
              style={{
                padding:
                  "14px 16px",

                marginBottom:
                  "18px",

                borderRadius:
                  "10px",

                background:
                  "#fef2f2",

                border:
                  "1px solid #fca5a5",

                color:
                  "#b91c1c",

                fontWeight:
                  "600"
              }}
            >
              ⚠️ {errorMessage}
            </div>

          )
        }


        {/* ======================================================
            STUDENT FETCH ERROR
        ====================================================== */}

        {
          studentsError && (

            <div
              style={{
                padding:
                  "14px 16px",

                marginBottom:
                  "18px",

                borderRadius:
                  "10px",

                background:
                  "#fff7ed",

                border:
                  "1px solid #fdba74",

                color:
                  "#c2410c"
              }}
            >

              <strong>
                Student Loading Error
              </strong>

              <br />

              {studentsError}

            </div>

          )
        }


        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="attendance-summary">

          <div className="summary-card">

            <h2>
              👨‍🎓
            </h2>

            <p>
              {
                studentId ||
                "No Student"
              }
            </p>

          </div>


          <div className="summary-card">

            <h2>
              📚
            </h2>

            <p>
              {
                studentClass ||
                "No Class"
              }
            </p>

          </div>


          <div className="summary-card">

            <h2>
              🩸
            </h2>

            <p>
              {
                bloodGroup ||
                "Not Added"
              }
            </p>

          </div>


          <div className="summary-card">

            <h2>
              🪪
            </h2>

            <p>
              {
                generatedSuccessfully
                  ?
                  `Version ${cardVersion}`
                  :
                  "Preview"
              }
            </p>

          </div>

        </div>


        {/* ======================================================
            MAIN FORM
        ====================================================== */}

        <div
          className="form-card"
          style={{
            marginTop:
              "24px"
          }}
        >

          <div
            style={{
              marginBottom:
                "20px"
            }}
          >

            <h2
              style={{
                margin:
                  "0 0 6px 0"
              }}
            >
              👨‍🎓 Student Information
            </h2>

            <p
              style={{
                margin:
                  0,

                color:
                  "#64748b"
              }}
            >
              Select a student and the available details will be filled automatically.
            </p>

          </div>


          {/* ====================================================
              STUDENT SELECT
          ==================================================== */}

          <div
            style={{
              marginBottom:
                "20px"
            }}
          >

            <label
              style={{
                display:
                  "block",

                marginBottom:
                  "8px",

                fontWeight:
                  "700"
              }}
            >
              Select Student *
            </label>


            <select
              value={
                selectedStudentDocId
              }
              onChange={
                (
                  event
                ) =>
                  handleStudentChange(
                    event.target.value
                  )
              }
              disabled={
                studentsLoading
              }
              style={{
                width:
                  "100%"
              }}
            >

              <option value="">

                {
                  studentsLoading
                    ?
                    "Loading Students..."
                    :
                    students.length === 0
                    ?
                    "No Students Found"
                    :
                    "Select Student"
                }

              </option>


              {
                students.map(
                  (
                    student
                  ) => (

                    <option
                      key={
                        student.id
                      }
                      value={
                        student.id
                      }
                    >

                      {
                        student.studentId ||
                        "No ID"
                      }

                      {" - "}

                      {
                        student.studentName ||
                        student.fullName ||
                        student.name ||
                        "Unnamed Student"
                      }

                    </option>

                  )
                )
              }

            </select>

          </div>


          {/* ====================================================
              AUTO FILLED STUDENT DETAILS
          ==================================================== */}

          <div className="form-grid">

            <div>

              <label>
                Student ID
              </label>

              <input
                type="text"
                value={
                  studentId
                }
                placeholder="Student ID"
                readOnly
              />

            </div>


            <div>

              <label>
                Admission Number
              </label>

              <input
                type="text"
                value={
                  admissionNumber
                }
                placeholder="Admission Number"
                readOnly
              />

            </div>


            <div>

              <label>
                Student Name
              </label>

              <input
                type="text"
                value={
                  studentName
                }
                placeholder="Student Name"
                readOnly
              />

            </div>


            <div>

              <label>
                Father Name
              </label>

              <input
                type="text"
                value={
                  fatherName
                }
                placeholder="Father Name"
                readOnly
              />

            </div>


            <div>

              <label>
                Mobile Number
              </label>

              <input
                type="text"
                value={
                  mobileNumber
                }
                placeholder="Mobile Number"
                readOnly
              />

            </div>


            <div>

              <label>
                Class
              </label>

              <input
                type="text"
                value={
                  studentClass
                }
                placeholder="Class"
                readOnly
              />

            </div>


            <div>

              <label>
                Blood Group
              </label>

              <input
                type="text"
                value={
                  bloodGroup
                }
                placeholder="Blood Group"
                readOnly
              />

            </div>


            <div>

              <label>
                Date of Birth
              </label>

              <input
                type="text"
                value={
                  dateOfBirth
                }
                placeholder="Date of Birth"
                readOnly
              />

            </div>

          </div>


          {/* ====================================================
              CARD SETTINGS HEADER
          ==================================================== */}

          <div
            style={{
              marginTop:
                "32px",

              marginBottom:
                "20px",

              paddingTop:
                "24px",

              borderTop:
                "1px solid #e2e8f0"
            }}
          >

            <h2
              style={{
                margin:
                  "0 0 6px 0"
              }}
            >
              🎨 Card Settings
            </h2>

            <p
              style={{
                margin:
                  0,

                color:
                  "#64748b"
              }}
            >
              Configure the card theme, dates, status and academic year.
            </p>

          </div>


          {/* ====================================================
              CARD SETTINGS FORM
          ==================================================== */}

          <div className="form-grid">

            <div>

              <label>
                Card Theme
              </label>

              <select
                value={
                  cardTheme
                }
                onChange={
                  (
                    event
                  ) =>
                    setCardTheme(
                      event.target.value
                    )
                }
              >

                <option value="Makkah">
                  Makkah
                </option>

                <option value="Green Gold">
                  Green Gold
                </option>

                <option value="Blue Premium">
                  Blue Premium
                </option>

              </select>

            </div>


            <div>

              <label>
                Card Status
              </label>

              <select
                value={
                  cardStatus
                }
                onChange={
                  (
                    event
                  ) =>
                    setCardStatus(
                      event.target.value
                    )
                }
              >

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

                <option value="Expired">
                  Expired
                </option>

                <option value="Lost">
                  Lost
                </option>

                <option value="Reissued">
                  Reissued
                </option>

              </select>

            </div>


            <div>

              <label>
                Academic Year *
              </label>

              <input
                type="text"
                value={
                  academicYear
                }
                onChange={
                  (
                    event
                  ) =>
                    setAcademicYear(
                      event.target.value
                    )
                }
                placeholder="Example: 2026-2027"
              />

            </div>


            <div>

              <label>
                Issue Date *
              </label>

              <input
                type="date"
                value={
                  issueDate
                }
                onChange={
                  (
                    event
                  ) =>
                    setIssueDate(
                      event.target.value
                    )
                }
              />

            </div>


            <div>

              <label>
                Expiry Date
              </label>

              <input
                type="date"
                value={
                  expiryDate
                }
                onChange={
                  (
                    event
                  ) =>
                    setExpiryDate(
                      event.target.value
                    )
                }
              />

            </div>

          </div>


          {/* ====================================================
              MADRASA INFORMATION
          ==================================================== */}

          <div
            style={{
              marginTop:
                "32px",

              marginBottom:
                "20px",

              paddingTop:
                "24px",

              borderTop:
                "1px solid #e2e8f0"
            }}
          >

            <h2
              style={{
                margin:
                  "0 0 6px 0"
              }}
            >
              🕌 Madrasa Card Information
            </h2>

            <p
              style={{
                margin:
                  0,

                color:
                  "#64748b"
              }}
            >
              These details appear on the identity card and are saved with the generated card.
            </p>

          </div>


          <div className="form-grid">

            <div>

              <label>
                Madrasa Name
              </label>

              <input
                type="text"
                value={
                  madrasaName
                }
                onChange={
                  (
                    event
                  ) =>
                    setMadrasaName(
                      event.target.value
                    )
                }
                placeholder="Madrasa Name"
              />

            </div>


            <div>

              <label>
                Card Subtitle
              </label>

              <input
                type="text"
                value={
                  madrasaSubtitle
                }
                onChange={
                  (
                    event
                  ) =>
                    setMadrasaSubtitle(
                      event.target.value
                    )
                }
                placeholder="Student Identity Card"
              />

            </div>


            <div>

              <label>
                Madrasa Mobile
              </label>

              <input
                type="text"
                value={
                  madrasaMobile
                }
                onChange={
                  (
                    event
                  ) =>
                    setMadrasaMobile(
                      event.target.value
                    )
                }
                placeholder="Madrasa Mobile Number"
              />

            </div>


            <div>

              <label>
                Madrasa Logo URL
              </label>

              <input
                type="text"
                value={
                  madrasaLogo
                }
                onChange={
                  (
                    event
                  ) =>
                    setMadrasaLogo(
                      event.target.value
                    )
                }
                placeholder="Logo URL"
              />

            </div>


            <div
              style={{
                gridColumn:
                  "1 / -1"
              }}
            >

              <label>
                Madrasa Address
              </label>

              <textarea
                value={
                  madrasaAddress
                }
                onChange={
                  (
                    event
                  ) =>
                    setMadrasaAddress(
                      event.target.value
                    )
                }
                placeholder="Madrasa Address"
                rows="3"
                style={{
                  width:
                    "100%"
                }}
              />

            </div>

          </div>


          {/* ====================================================
              GENERATE BUTTON
          ==================================================== */}

          <div
            style={{
              marginTop:
                "28px",

              display:
                "flex",

              alignItems:
                "center",

              gap:
                "12px",

              flexWrap:
                "wrap"
            }}
          >

            <button
              type="button"
              className="save-all-btn"
              onClick={
                generateAndSaveIDCard
              }
              disabled={
                isSaving ||
                !selectedStudentDocId
              }
            >

              {
                isSaving
                  ?
                  "⏳ Generating ID Card..."
                  :
                  generatedSuccessfully
                  ?
                  "🔄 Generate Reissued Card"
                  :
                  "🪪 Generate & Save ID Card"
              }

            </button>


            {
              selectedStudentDocId && (

                <button
                  type="button"
                  onClick={
                    clearStudentDetails
                  }
                  disabled={
                    isSaving
                  }
                >
                  ✖ Clear Student
                </button>

              )
            }

          </div>

        </div>


        {/* ======================================================
            PREVIEW SECTION HEADER
        ====================================================== */}

        <div
          style={{
            marginTop:
              "36px",

            marginBottom:
              "20px",

            textAlign:
              "center"
          }}
        >

          <h2
            style={{
              marginBottom:
                "6px"
            }}
          >
            🪪 Live Student ID Card Preview
          </h2>

          <p
            style={{
              margin:
                0,

              color:
                "#64748b"
            }}
          >
            The preview updates automatically when you change the student or card settings.
          </p>

        </div>
                {/* ======================================================
            PREMIUM ID CARD
        ====================================================== */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "center",

            padding:
              "10px"
          }}
        >

          <div
            ref={
              cardRef
            }
            id="student-id-card"
            style={{
              width:
                "360px",

              minHeight:
                "570px",

              position:
                "relative",

              overflow:
                "hidden",

              borderRadius:
                "22px",

              background:
                themeConfig.background,

              color:
                themeConfig.text,

              boxShadow:
                "0 18px 45px rgba(15, 23, 42, 0.24)",

              border:
                `2px solid ${themeConfig.accent}`,

              fontFamily:
                "Arial, Helvetica, sans-serif"
            }}
          >

            {/* ==================================================
                DECORATIVE BACKGROUND
            ================================================== */}

            <div
              style={{
                position:
                  "absolute",

                top:
                  "-90px",

                right:
                  "-90px",

                width:
                  "220px",

                height:
                  "220px",

                borderRadius:
                  "50%",

                border:
                  `35px solid ${themeConfig.accent}`,

                opacity:
                  "0.08",

                pointerEvents:
                  "none"
              }}
            />


            <div
              style={{
                position:
                  "absolute",

                bottom:
                  "-100px",

                left:
                  "-100px",

                width:
                  "240px",

                height:
                  "240px",

                borderRadius:
                  "50%",

                border:
                  `40px solid ${themeConfig.primary}`,

                opacity:
                  "0.06",

                pointerEvents:
                  "none"
              }}
            />


            {/* ==================================================
                CARD HEADER
            ================================================== */}

            <div
              style={{
                position:
                  "relative",

                zIndex:
                  2,

                padding:
                  "22px 20px 30px",

                textAlign:
                  "center",

                color:
                  "#ffffff",

                background:
                  themeConfig.headerGradient,

                borderBottom:
                  `4px solid ${themeConfig.accent}`
              }}
            >

              {/* ================================================
                  TOP DECORATION
              ================================================ */}

              <div
                style={{
                  position:
                    "absolute",

                  top:
                    "10px",

                  left:
                    "16px",

                  color:
                    themeConfig.accent,

                  opacity:
                    "0.9",

                  fontSize:
                    "18px"
                }}
              >
                ✦
              </div>


              <div
                style={{
                  position:
                    "absolute",

                  top:
                    "10px",

                  right:
                    "16px",

                  color:
                    themeConfig.accent,

                  opacity:
                    "0.9",

                  fontSize:
                    "18px"
                }}
              >
                ✦
              </div>


              {/* ================================================
                  MADRASA LOGO
              ================================================ */}

              <div
                style={{
                  width:
                    "64px",

                  height:
                    "64px",

                  margin:
                    "0 auto 10px",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  overflow:
                    "hidden",

                  borderRadius:
                    "50%",

                  background:
                    "#ffffff",

                  border:
                    `3px solid ${themeConfig.accent}`,

                  boxShadow:
                    "0 5px 14px rgba(0, 0, 0, 0.18)"
                }}
              >

                {
                  madrasaLogo
                    ? (

                      <img
                        src={
                          madrasaLogo
                        }
                        alt="Madrasa Logo"
                        crossOrigin="anonymous"
                        style={{
                          width:
                            "100%",

                          height:
                            "100%",

                          objectFit:
                            "cover"
                        }}
                      />

                    )
                    : (

                      <span
                        style={{
                          fontSize:
                            "34px"
                        }}
                      >
                        🕌
                      </span>

                    )
                }

              </div>


              {/* ================================================
                  MADRASA NAME
              ================================================ */}

              <h2
                style={{
                  margin:
                    "0",

                  padding:
                    "0 8px",

                  fontSize:
                    "21px",

                  lineHeight:
                    "1.25",

                  fontWeight:
                    "800",

                  letterSpacing:
                    "0.5px",

                  textTransform:
                    "uppercase"
                }}
              >
                {
                  madrasaName ||
                  "MA MADRASA ERP"
                }
              </h2>


              {/* ================================================
                  CARD SUBTITLE
              ================================================ */}

              <p
                style={{
                  margin:
                    "7px 0 0",

                  fontSize:
                    "12px",

                  fontWeight:
                    "600",

                  letterSpacing:
                    "1.8px",

                  textTransform:
                    "uppercase",

                  color:
                    "#f8fafc"
                }}
              >
                {
                  madrasaSubtitle ||
                  "Student Identity Card"
                }
              </p>


              {/* ================================================
                  ACADEMIC YEAR BADGE
              ================================================ */}

              <div
                style={{
                  display:
                    "inline-block",

                  marginTop:
                    "10px",

                  padding:
                    "5px 12px",

                  borderRadius:
                    "999px",

                  background:
                    "rgba(255, 255, 255, 0.16)",

                  border:
                    "1px solid rgba(255, 255, 255, 0.35)",

                  fontSize:
                    "11px",

                  fontWeight:
                    "700"
                }}
              >
                Academic Year:
                {" "}
                {
                  academicYear ||
                  "-"
                }
              </div>

            </div>


            {/* ==================================================
                STUDENT PHOTO
            ================================================== */}

            <div
              style={{
                position:
                  "relative",

                zIndex:
                  4,

                width:
                  "116px",

                height:
                  "116px",

                margin:
                  "-22px auto 0",

                overflow:
                  "hidden",

                borderRadius:
                  "50%",

                background:
                  "#f1f5f9",

                border:
                  `5px solid ${themeConfig.accent}`,

                boxShadow:
                  "0 7px 20px rgba(15, 23, 42, 0.22)"
              }}
            >

              {
                photoUrl
                  ? (

                    <img
                      src={
                        photoUrl
                      }
                      alt="Student"
                      crossOrigin="anonymous"
                      style={{
                        width:
                          "100%",

                        height:
                          "100%",

                        objectFit:
                          "cover"
                      }}
                    />

                  )
                  : (

                    <div
                      style={{
                        width:
                          "100%",

                        height:
                          "100%",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        background:
                          `linear-gradient(
                            135deg,
                            ${themeConfig.primary},
                            ${themeConfig.secondary}
                          )`,

                        color:
                          "#ffffff",

                        fontSize:
                          "34px",

                        fontWeight:
                          "800",

                        letterSpacing:
                          "1px"
                      }}
                    >
                      {
                        studentInitials
                      }
                    </div>

                  )
              }

            </div>


            {/* ==================================================
                STUDENT NAME
            ================================================== */}

            <div
              style={{
                position:
                  "relative",

                zIndex:
                  2,

                padding:
                  "13px 20px 0",

                textAlign:
                  "center"
              }}
            >

              <h2
                style={{
                  margin:
                    "0",

                  color:
                    themeConfig.primary,

                  fontSize:
                    "22px",

                  lineHeight:
                    "1.25",

                  fontWeight:
                    "800",

                  wordBreak:
                    "break-word"
                }}
              >
                {
                  displayValue(
                    studentName,
                    "Student Name"
                  )
                }
              </h2>


              <div
                style={{
                  marginTop:
                    "7px",

                  display:
                    "inline-block",

                  padding:
                    "5px 13px",

                  borderRadius:
                    "999px",

                  color:
                    "#ffffff",

                  background:
                    cardStatusColor,

                  fontSize:
                    "11px",

                  fontWeight:
                    "800",

                  letterSpacing:
                    "0.5px"
                }}
              >
                {
                  cardStatus
                }
              </div>

            </div>


            {/* ==================================================
                STUDENT DETAILS
            ================================================== */}

            <div
              style={{
                position:
                  "relative",

                zIndex:
                  2,

                padding:
                  "18px 22px 12px"
              }}
            >

              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "1fr 1fr",

                  gap:
                    "10px"
                }}
              >

                {/* ==============================================
                    STUDENT ID
                ============================================== */}

                <div
                  style={{
                    padding:
                      "10px",

                    borderRadius:
                      "10px",

                    background:
                      `${themeConfig.primary}0D`,

                    border:
                      `1px solid ${themeConfig.primary}22`
                  }}
                >

                  <div
                    style={{
                      marginBottom:
                        "3px",

                      color:
                        themeConfig.mutedText,

                      fontSize:
                        "9px",

                      fontWeight:
                        "700",

                      textTransform:
                        "uppercase",

                      letterSpacing:
                        "0.6px"
                    }}
                  >
                    Student ID
                  </div>


                  <div
                    style={{
                      color:
                        themeConfig.text,

                      fontSize:
                        "12px",

                      fontWeight:
                        "800",

                      wordBreak:
                        "break-word"
                    }}
                  >
                    {
                      displayValue(
                        studentId
                      )
                    }
                  </div>

                </div>


                {/* ==============================================
                    ADMISSION NUMBER
                ============================================== */}

                <div
                  style={{
                    padding:
                      "10px",

                    borderRadius:
                      "10px",

                    background:
                      `${themeConfig.primary}0D`,

                    border:
                      `1px solid ${themeConfig.primary}22`
                  }}
                >

                  <div
                    style={{
                      marginBottom:
                        "3px",

                      color:
                        themeConfig.mutedText,

                      fontSize:
                        "9px",

                      fontWeight:
                        "700",

                      textTransform:
                        "uppercase",

                      letterSpacing:
                        "0.6px"
                    }}
                  >
                    Admission No.
                  </div>


                  <div
                    style={{
                      color:
                        themeConfig.text,

                      fontSize:
                        "12px",

                      fontWeight:
                        "800",

                      wordBreak:
                        "break-word"
                    }}
                  >
                    {
                      displayValue(
                        admissionNumber
                      )
                    }
                  </div>

                </div>


                {/* ==============================================
                    CLASS
                ============================================== */}

                <div
                  style={{
                    padding:
                      "10px",

                    borderRadius:
                      "10px",

                    background:
                      `${themeConfig.primary}0D`,

                    border:
                      `1px solid ${themeConfig.primary}22`
                  }}
                >

                  <div
                    style={{
                      marginBottom:
                        "3px",

                      color:
                        themeConfig.mutedText,

                      fontSize:
                        "9px",

                      fontWeight:
                        "700",

                      textTransform:
                        "uppercase",

                      letterSpacing:
                        "0.6px"
                    }}
                  >
                    Class
                  </div>


                  <div
                    style={{
                      color:
                        themeConfig.text,

                      fontSize:
                        "12px",

                      fontWeight:
                        "800"
                    }}
                  >
                    {
                      displayValue(
                        studentClass
                      )
                    }
                  </div>

                </div>


                {/* ==============================================
                    BLOOD GROUP
                ============================================== */}

                <div
                  style={{
                    padding:
                      "10px",

                    borderRadius:
                      "10px",

                    background:
                      `${themeConfig.primary}0D`,

                    border:
                      `1px solid ${themeConfig.primary}22`
                  }}
                >

                  <div
                    style={{
                      marginBottom:
                        "3px",

                      color:
                        themeConfig.mutedText,

                      fontSize:
                        "9px",

                      fontWeight:
                        "700",

                      textTransform:
                        "uppercase",

                      letterSpacing:
                        "0.6px"
                    }}
                  >
                    Blood Group
                  </div>


                  <div
                    style={{
                      color:
                        "#b91c1c",

                      fontSize:
                        "12px",

                      fontWeight:
                        "800"
                    }}
                  >
                    {
                      displayValue(
                        bloodGroup
                      )
                    }
                  </div>

                </div>

              </div>

            </div>


            {/* ==================================================
                LOWER CARD INFORMATION
            ================================================== */}

            <div
              style={{
                position:
                  "relative",

                zIndex:
                  2,

                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "14px",

                padding:
                  "4px 22px 18px"
              }}
            >

              {/* ================================================
                  QR CODE
              ================================================ */}

              <div
                style={{
                  flexShrink:
                    0,

                  padding:
                    "7px",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  borderRadius:
                    "12px",

                  background:
                    "#ffffff",

                  border:
                    `2px solid ${themeConfig.accent}`
                }}
              >

                <QRCodeCanvas
                  value={
                    qrValue
                  }
                  size={
                    82
                  }
                  level="H"
                  includeMargin={
                    false
                  }
                  bgColor="#ffffff"
                  fgColor="#111827"
                />

              </div>


              {/* ================================================
                  CARD INFORMATION
              ================================================ */}

              <div
                style={{
                  minWidth:
                    0,

                  flex:
                    1
                }}
              >

                <div
                  style={{
                    marginBottom:
                      "8px"
                  }}
                >

                  <div
                    style={{
                      color:
                        themeConfig.mutedText,

                      fontSize:
                        "9px",

                      fontWeight:
                        "700",

                      textTransform:
                        "uppercase"
                    }}
                  >
                    Card Number
                  </div>


                  <div
                    style={{
                      marginTop:
                        "2px",

                      color:
                        themeConfig.text,

                      fontSize:
                        "11px",

                      fontWeight:
                        "800",

                      wordBreak:
                        "break-word"
                    }}
                  >
                    {
                      cardNumber ||
                      "Generated After Save"
                    }
                  </div>

                </div>


                <div
                  style={{
                    marginBottom:
                      "8px"
                  }}
                >

                  <div
                    style={{
                      color:
                        themeConfig.mutedText,

                      fontSize:
                        "9px",

                      fontWeight:
                        "700",

                      textTransform:
                        "uppercase"
                    }}
                  >
                    Issue Date
                  </div>


                  <div
                    style={{
                      marginTop:
                        "2px",

                      color:
                        themeConfig.text,

                      fontSize:
                        "11px",

                      fontWeight:
                        "700"
                    }}
                  >
                    {
                      formatDisplayDate(
                        issueDate
                      )
                    }
                  </div>

                </div>


                <div>

                  <div
                    style={{
                      color:
                        themeConfig.mutedText,

                      fontSize:
                        "9px",

                      fontWeight:
                        "700",

                      textTransform:
                        "uppercase"
                    }}
                  >
                    Expiry Date
                  </div>


                  <div
                    style={{
                      marginTop:
                        "2px",

                      color:
                        themeConfig.text,

                      fontSize:
                        "11px",

                      fontWeight:
                        "700"
                    }}
                  >
                    {
                      expiryDate
                        ?
                        formatDisplayDate(
                          expiryDate
                        )
                        :
                        "Not Set"
                    }
                  </div>

                </div>

              </div>

            </div>


            {/* ==================================================
                CARD FOOTER
            ================================================== */}

            <div
              style={{
                position:
                  "relative",

                zIndex:
                  2,

                padding:
                  "11px 16px",

                textAlign:
                  "center",

                background:
                  themeConfig.headerGradient,

                borderTop:
                  `3px solid ${themeConfig.accent}`,

                color:
                  "#ffffff"
              }}
            >

              <div
                style={{
                  fontSize:
                    "9px",

                  fontWeight:
                    "700",

                  letterSpacing:
                    "0.4px"
                }}
              >
                IF FOUND, PLEASE RETURN TO
              </div>


              <div
                style={{
                  marginTop:
                    "3px",

                  fontSize:
                    "11px",

                  fontWeight:
                    "800"
                }}
              >
                {
                  madrasaName ||
                  "MA MADRASA ERP"
                }
              </div>


              {
                (
                  madrasaMobile ||
                  madrasaAddress
                ) && (

                  <div
                    style={{
                      marginTop:
                        "3px",

                      padding:
                        "0 8px",

                      fontSize:
                        "8px",

                      lineHeight:
                        "1.35",

                      opacity:
                        "0.9"
                    }}
                  >

                    {
                      madrasaMobile &&
                      (
                        <span>
                          {
                            madrasaMobile
                          }
                        </span>
                      )
                    }


                    {
                      madrasaMobile &&
                      madrasaAddress &&
                      (
                        <span>
                          {" • "}
                        </span>
                      )
                    }


                    {
                      madrasaAddress &&
                      (
                        <span>
                          {
                            madrasaAddress
                          }
                        </span>
                      )
                    }

                  </div>

                )
              }

            </div>

          </div>

        </div>
                {/* ======================================================
            GENERATED CARD INFORMATION
        ====================================================== */}

        {
          generatedSuccessfully && (

            <div
              style={{
                maxWidth:
                  "760px",

                margin:
                  "28px auto 0",

                padding:
                  "20px",

                borderRadius:
                  "14px",

                background:
                  "#ecfdf5",

                border:
                  "1px solid #86efac"
              }}
            >

              <h3
                style={{
                  margin:
                    "0 0 14px",

                  color:
                    "#166534"
                }}
              >
                ✅ ID Card Saved Successfully
              </h3>


              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(160px, 1fr))",

                  gap:
                    "12px"
                }}
              >

                <div>

                  <strong>
                    Card Number
                  </strong>

                  <p
                    style={{
                      margin:
                        "4px 0 0"
                    }}
                  >
                    {
                      cardNumber
                    }
                  </p>

                </div>


                <div>

                  <strong>
                    Card Version
                  </strong>

                  <p
                    style={{
                      margin:
                        "4px 0 0"
                    }}
                  >
                    {
                      cardVersion
                    }
                  </p>

                </div>


                <div>

                  <strong>
                    Card Type
                  </strong>

                  <p
                    style={{
                      margin:
                        "4px 0 0"
                    }}
                  >
                    {
                      isReissued
                        ?
                        "Reissued Card"
                        :
                        "Original Card"
                    }
                  </p>

                </div>


                <div>

                  <strong>
                    Status
                  </strong>

                  <p
                    style={{
                      margin:
                        "4px 0 0"
                    }}
                  >
                    {
                      cardStatus
                    }
                  </p>

                </div>

              </div>

            </div>

          )
        }


        {/* ======================================================
            EXPORT ACTIONS
        ====================================================== */}

        <div
          style={{
            maxWidth:
              "760px",

            margin:
              "28px auto 0",

            padding:
              "22px",

            borderRadius:
              "16px",

            background:
              "#ffffff",

            boxShadow:
              "0 8px 25px rgba(15, 23, 42, 0.08)"
          }}
        >

          <div
            style={{
              textAlign:
                "center",

              marginBottom:
                "18px"
            }}
          >

            <h2
              style={{
                margin:
                  "0 0 6px"
              }}
            >
              📤 Export ID Card
            </h2>


            <p
              style={{
                margin:
                  0,

                color:
                  "#64748b"
              }}
            >
              Download or print the currently displayed student identity card.
            </p>

          </div>


          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap:
                "12px",

              flexWrap:
                "wrap"
            }}
          >

            {/* ==================================================
                PNG DOWNLOAD
            ================================================== */}

            <button
              type="button"
              onClick={
                downloadPNG
              }
              disabled={
                !canExportCard ||
                isDownloadingPNG ||
                isDownloadingPDF ||
                isPrinting
              }
            >

              {
                isDownloadingPNG
                  ?
                  "⏳ Creating PNG..."
                  :
                  "📥 Download PNG"
              }

            </button>


            {/* ==================================================
                PDF DOWNLOAD
            ================================================== */}

            <button
              type="button"
              onClick={
                downloadPDF
              }
              disabled={
                !canExportCard ||
                isDownloadingPNG ||
                isDownloadingPDF ||
                isPrinting
              }
            >

              {
                isDownloadingPDF
                  ?
                  "⏳ Creating PDF..."
                  :
                  "📄 Download PDF"
              }

            </button>


            {/* ==================================================
                PRINT
            ================================================== */}

            <button
              type="button"
              onClick={
                printCard
              }
              disabled={
                !canExportCard ||
                isDownloadingPNG ||
                isDownloadingPDF ||
                isPrinting
              }
            >

              {
                isPrinting
                  ?
                  "⏳ Preparing Print..."
                  :
                  "🖨 Print ID Card"
              }

            </button>


            {/* ==================================================
                GENERATE ANOTHER
            ================================================== */}

            {
              generatedSuccessfully && (

                <button
                  type="button"
                  onClick={
                    generateAnotherCard
                  }
                  disabled={
                    isDownloadingPNG ||
                    isDownloadingPDF ||
                    isPrinting ||
                    isSaving
                  }
                >
                  ➕ Generate Another Card
                </button>

              )
            }

          </div>


          {/* ====================================================
              EXPORT HELP MESSAGE
          ==================================================== */}

          {
            !canExportCard && (

              <p
                style={{
                  margin:
                    "16px 0 0",

                  textAlign:
                    "center",

                  color:
                    "#b45309",

                  fontSize:
                    "13px",

                  fontWeight:
                    "600"
                }}
              >
                ⚠️ Select a student to enable PNG, PDF and Print options.
              </p>

            )
          }

        </div>


        {/* ======================================================
            CARD INFORMATION / NOTES
        ====================================================== */}

        <div
          style={{
            maxWidth:
              "760px",

            margin:
              "24px auto 0",

            padding:
              "18px",

            borderRadius:
              "14px",

            background:
              "#f8fafc",

            border:
              "1px solid #e2e8f0"
          }}
        >

          <h3
            style={{
              margin:
                "0 0 12px"
            }}
          >
            ℹ️ ID Card Information
          </h3>


          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",

              gap:
                "12px",

              fontSize:
                "13px"
            }}
          >

            <div>

              <strong>
                Selected Theme
              </strong>

              <p
                style={{
                  margin:
                    "4px 0 0",

                  color:
                    "#64748b"
                }}
              >
                {
                  cardTheme
                }
              </p>

            </div>


            <div>

              <strong>
                Academic Year
              </strong>

              <p
                style={{
                  margin:
                    "4px 0 0",

                  color:
                    "#64748b"
                }}
              >
                {
                  academicYear ||
                  "-"
                }
              </p>

            </div>


            <div>

              <strong>
                Issue Date
              </strong>

              <p
                style={{
                  margin:
                    "4px 0 0",

                  color:
                    "#64748b"
                }}
              >
                {
                  formatDisplayDate(
                    issueDate
                  )
                }
              </p>

            </div>


            <div>

              <strong>
                Expiry Date
              </strong>

              <p
                style={{
                  margin:
                    "4px 0 0",

                  color:
                    "#64748b"
                }}
              >
                {
                  expiryDate
                    ?
                    formatDisplayDate(
                      expiryDate
                    )
                    :
                    "Not Set"
                }
              </p>

            </div>

          </div>

        </div>


        {/* ======================================================
            BOTTOM SPACING
        ====================================================== */}

        <div
          style={{
            height:
              "40px"
          }}
        />

      </div>

    </Layout>

  );

}

export default GenerateIDCard;