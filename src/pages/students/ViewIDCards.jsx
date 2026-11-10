import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeCanvas } from "qrcode.react";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
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

function ViewIDCards() {
    const madrasaId =
    localStorage.getItem(
      "madrasaId"
    );

  // ============================================================
  // REFERENCES
  // ============================================================

  const cardPreviewRef =
    useRef(null);

  const isMountedRef =
    useRef(true);


  // ============================================================
  // ID CARD DATA
  // ============================================================

  const [
    idCards,
    setIdCards
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage
  ] = useState("");


  // ============================================================
  // SEARCH AND FILTER STATES
  // ============================================================

  const [
    searchText,
    setSearchText
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter
  ] = useState("All");


  const [
    themeFilter,
    setThemeFilter
  ] = useState("All");


  const [
    cardTypeFilter,
    setCardTypeFilter
  ] = useState("All");


  const [
    sortOption,
    setSortOption
  ] = useState("Newest");


  // ============================================================
  // SELECTED CARD
  // ============================================================

  const [
    selectedCard,
    setSelectedCard
  ] = useState(null);


  const [
    showCardPreview,
    setShowCardPreview
  ] = useState(false);


  // ============================================================
  // ACTION LOADING STATES
  // ============================================================

  const [
    actionCardId,
    setActionCardId
  ] = useState("");


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
    isDeleting,
    setIsDeleting
  ] = useState(false);


  const [
    isUpdatingStatus,
    setIsUpdatingStatus
  ] = useState(false);


  // ============================================================
  // DELETE CONFIRMATION
  // ============================================================

  const [
    cardPendingDelete,
    setCardPendingDelete
  ] = useState(null);


  const [
    showDeleteConfirmation,
    setShowDeleteConfirmation
  ] = useState(false);


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
  // FIRESTORE TIMESTAMP TO DATE
  // ============================================================

  const firestoreTimestampToDate =
    (
      timestamp
    ) => {

      if (
        !timestamp
      ) {

        return null;

      }


      if (
        typeof timestamp.toDate ===
        "function"
      ) {

        return timestamp.toDate();

      }


      if (
        timestamp.seconds
      ) {

        return new Date(
          timestamp.seconds *
          1000
        );

      }


      const convertedDate =
        new Date(
          timestamp
        );


      if (
        Number.isNaN(
          convertedDate.getTime()
        )
      ) {

        return null;

      }


      return convertedDate;

    };


  // ============================================================
  // FETCH ALL STUDENT ID CARDS
  // ============================================================

  const fetchIDCards =
    useCallback(
      async () => {

        setLoading(
          true
        );


        setErrorMessage(
          ""
        );


        try {

          let cardsSnapshot;


          try {

            const cardsQuery =
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
    orderBy(
      "createdAt",
      "desc"
    )
  );

            cardsSnapshot =
              await getDocs(
                cardsQuery
              );

          }
          catch (
            queryError
          ) {

            console.warn(
              "Ordered ID card query failed. Using fallback query:",
              queryError
            );


            const fallbackQuery =
  query(
    collection(
      db,
      "studentIdCards"
    ),
    where(
      "madrasaId",
      "==",
      madrasaId
    )
  );


cardsSnapshot =
  await getDocs(
    fallbackQuery
  );

          }


          const cardsList =
            cardsSnapshot.docs.map(
              (
                cardDocument
              ) => {

                return {

                  id:
                    cardDocument.id,

                  ...cardDocument.data()

                };

              }
            );


          cardsList.sort(
            (
              firstCard,
              secondCard
            ) => {

              const firstDate =
                firestoreTimestampToDate(
                  firstCard.createdAt
                );


              const secondDate =
                firestoreTimestampToDate(
                  secondCard.createdAt
                );


              return (
                (
                  secondDate?.getTime() ||
                  0
                ) -
                (
                  firstDate?.getTime() ||
                  0
                )
              );

            }
          );


          if (
            isMountedRef.current
          ) {

            setIdCards(
              cardsList
            );

          }

        }
        catch (
          error
        ) {

          console.error(
            "Error fetching ID cards:",
            error
          );


          if (
            isMountedRef.current
          ) {

            setErrorMessage(
              "Unable to load student ID cards. Please try again."
            );

          }

        }
        finally {

          if (
            isMountedRef.current
          ) {

            setLoading(
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
  // LOAD CARDS WHEN PAGE OPENS
  // ============================================================

  useEffect(
    () => {

      fetchIDCards();

    },
    [
      fetchIDCards
    ]
  );


  // ============================================================
  // UNIQUE AVAILABLE THEMES
  // ============================================================

  const availableThemes =
    useMemo(
      () => {

        const themeNames =
          idCards
            .map(
              (
                card
              ) =>
                card.cardTheme
            )
            .filter(
              Boolean
            );


        return [
          ...new Set(
            themeNames
          )
        ].sort();

      },
      [
        idCards
      ]
    );


  // ============================================================
  // FILTER AND SORT ID CARDS
  // ============================================================

  const filteredIDCards =
    useMemo(
      () => {

        const normalizedSearch =
          searchText
            .trim()
            .toLowerCase();


        let filteredCards =
          idCards.filter(
            (
              card
            ) => {

              // ================================================
              // SEARCH
              // ================================================

              const searchableValues = [

                card.studentName,

                card.studentId,

                card.admissionNumber,

                card.cardNumber,

                card.fatherName,

                card.mobileNumber,

                card.studentClass

              ];


              const matchesSearch =
                !normalizedSearch ||
                searchableValues.some(
                  (
                    value
                  ) =>
                    String(
                      value ||
                      ""
                    )
                      .toLowerCase()
                      .includes(
                        normalizedSearch
                      )
                );


              // ================================================
              // STATUS FILTER
              // ================================================

              const matchesStatus =
                statusFilter ===
                  "All" ||
                card.cardStatus ===
                  statusFilter;


              // ================================================
              // THEME FILTER
              // ================================================

              const matchesTheme =
                themeFilter ===
                  "All" ||
                card.cardTheme ===
                  themeFilter;


              // ================================================
              // ORIGINAL / REISSUED FILTER
              // ================================================

              const matchesCardType =

                cardTypeFilter ===
                  "All"

                  ?

                  true

                  :

                cardTypeFilter ===
                  "Original"

                  ?

                  !card.isReissued

                  :

                cardTypeFilter ===
                  "Reissued"

                  ?

                  Boolean(
                    card.isReissued
                  )

                  :

                  true;


              return (
                matchesSearch &&
                matchesStatus &&
                matchesTheme &&
                matchesCardType
              );

            }
          );


        // ======================================================
        // SORTING
        // ======================================================

        filteredCards.sort(
          (
            firstCard,
            secondCard
          ) => {

            if (
              sortOption ===
              "Student Name"
            ) {

              return String(
                firstCard.studentName ||
                ""
              ).localeCompare(
                String(
                  secondCard.studentName ||
                  ""
                )
              );

            }


            if (
              sortOption ===
              "Oldest"
            ) {

              const firstDate =
                firestoreTimestampToDate(
                  firstCard.createdAt
                );


              const secondDate =
                firestoreTimestampToDate(
                  secondCard.createdAt
                );


              return (
                (
                  firstDate?.getTime() ||
                  0
                ) -
                (
                  secondDate?.getTime() ||
                  0
                )
              );

            }


            if (
              sortOption ===
              "Card Version"
            ) {

              return (
                Number(
                  secondCard.cardVersion ||
                  1
                ) -
                Number(
                  firstCard.cardVersion ||
                  1
                )
              );

            }


            // DEFAULT:
            // NEWEST FIRST

            const firstDate =
              firestoreTimestampToDate(
                firstCard.createdAt
              );


            const secondDate =
              firestoreTimestampToDate(
                secondCard.createdAt
              );


            return (
              (
                secondDate?.getTime() ||
                0
              ) -
              (
                firstDate?.getTime() ||
                0
              )
            );

          }
        );


        return filteredCards;

      },
      [
        idCards,
        searchText,
        statusFilter,
        themeFilter,
        cardTypeFilter,
        sortOption
      ]
    );


  // ============================================================
  // DASHBOARD STATISTICS
  // ============================================================

  const cardStatistics =
    useMemo(
      () => {

        const totalCards =
          idCards.length;


        const activeCards =
          idCards.filter(
            (
              card
            ) =>
              card.cardStatus ===
              "Active"
          ).length;


        const reissuedCards =
          idCards.filter(
            (
              card
            ) =>
              Boolean(
                card.isReissued
              )
          ).length;


        const lostCards =
          idCards.filter(
            (
              card
            ) =>
              card.cardStatus ===
                "Lost" ||
              Boolean(
                card.isLost
              )
          ).length;


        return {

          totalCards,

          activeCards,

          reissuedCards,

          lostCards

        };

      },
      [
        idCards
      ]
    );


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate =
    (
      dateValue
    ) => {

      if (
        !dateValue
      ) {

        return "-";

      }


      let date;


      if (
        typeof dateValue ===
        "string"
      ) {

        date =
          new Date(
            `${dateValue}T00:00:00`
          );

      }
      else {

        date =
          firestoreTimestampToDate(
            dateValue
          );

      }


      if (
        !date ||
        Number.isNaN(
          date.getTime()
        )
      ) {

        return "-";

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
  // SELECT CARD FOR FULL PREVIEW
  // ============================================================

  const openCardPreview =
    (
      card
    ) => {

      setSelectedCard(
        card
      );


      setShowCardPreview(
        true
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      setTimeout(
        () => {

          window.scrollTo(
            {
              top:
                document.body.scrollHeight,

              behavior:
                "smooth"
            }
          );

        },
        100
      );

    };


  // ============================================================
  // CLOSE CARD PREVIEW
  // ============================================================

  const closeCardPreview =
    () => {

      setSelectedCard(
        null
      );


      setShowCardPreview(
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
  // GET SAVED THEME CONFIGURATION
  // ============================================================

  const selectedCardTheme =
    useMemo(
      () => {

        if (
          !selectedCard
        ) {

          return {

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

          };

        }


        // ======================================================
        // USE SAVED THEME SNAPSHOT WHEN AVAILABLE
        // ======================================================

        if (
          selectedCard.themeSnapshot
        ) {

          const savedTheme =
            selectedCard.themeSnapshot;


          const primary =
            savedTheme.primaryColor ||
            "#076b55";


          const secondary =
            savedTheme.secondaryColor ||
            "#0f8f78";


          const accent =
            savedTheme.accentColor ||
            "#d4af37";


          const background =
            savedTheme.backgroundColor ||
            "#ffffff";


          const text =
            savedTheme.textColor ||
            "#1e293b";


          return {

            primary,

            secondary,

            accent,

            background,

            text,

            mutedText:
              "#64748b",

            headerGradient:
              `linear-gradient(
                135deg,
                ${primary} 0%,
                ${secondary} 60%,
                ${primary} 100%
              )`

          };

        }


        // ======================================================
        // FALLBACK THEMES FOR OLD CARDS
        // ======================================================

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
          themes[
            selectedCard.cardTheme
          ] ||
          themes.Makkah
        );

      },
      [
        selectedCard
      ]
    );


  // ============================================================
  // SELECTED CARD QR VALUE
  // ============================================================

  const selectedCardQRValue =
    useMemo(
      () => {

        if (
          !selectedCard
        ) {

          return JSON.stringify(
            {
              type:
                "STUDENT_ID_CARD",

              status:
                "NO_CARD_SELECTED"
            }
          );

        }


        // ======================================================
        // USE SAVED QR DATA FIRST
        // ======================================================

        if (
          selectedCard.qrData
        ) {

          return selectedCard.qrData;

        }


        if (
          selectedCard.qrCode
        ) {

          return selectedCard.qrCode;

        }


        // ======================================================
        // FALLBACK QR FOR OLD CARDS
        // ======================================================

        return JSON.stringify(
          {

            type:
              "STUDENT_ID_CARD",

            cardNumber:
              selectedCard.cardNumber ||
              "",

            studentId:
              selectedCard.studentId ||
              "",

            studentName:
              selectedCard.studentName ||
              "",

            studentClass:
              selectedCard.studentClass ||
              "",

            bloodGroup:
              selectedCard.bloodGroup ||
              "",

            academicYear:
              selectedCard.academicYear ||
              "",

            cardVersion:
              selectedCard.cardVersion ||
              1,

            status:
              selectedCard.cardStatus ||
              "Active"

          }
        );

      },
      [
        selectedCard
      ]
    );


  // ============================================================
  // SELECTED STUDENT INITIALS
  // ============================================================

  const selectedStudentInitials =
    useMemo(
      () => {

        const studentName =
          selectedCard?.studentName ||
          "";


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
        selectedCard
      ]
    );


  // ============================================================
  // SELECTED CARD STATUS COLOR
  // ============================================================

  const selectedCardStatusColor =
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
          statusColors[
            selectedCard?.cardStatus
          ] ||
          "#15803d"
        );

      },
      [
        selectedCard
      ]
    );


  // ============================================================
  // UPDATE CARD STATUS
  // ============================================================

  const updateCardStatus =
    async (
      card,
      newStatus
    ) => {

      if (
        !card?.id ||
        isUpdatingStatus
      ) {

        return;

      }


      setIsUpdatingStatus(
        true
      );


      setActionCardId(
        card.id
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      try {

        const updateData = {

          cardStatus:
            newStatus,

          isLost:
            newStatus ===
            "Lost",

          updatedAt:
            serverTimestamp()

        };


        await updateDoc(
          doc(
            db,
            "studentIdCards",
            card.id
          ),
          updateData
        );


        // ======================================================
        // UPDATE LOCAL LIST
        // ======================================================

        setIdCards(
          (
            previousCards
          ) =>
            previousCards.map(
              (
                currentCard
              ) => {

                if (
                  currentCard.id !==
                  card.id
                ) {

                  return currentCard;

                }


                return {

                  ...currentCard,

                  ...updateData

                };

              }
            )
        );


        // ======================================================
        // UPDATE OPEN PREVIEW
        // ======================================================

        setSelectedCard(
          (
            previousSelectedCard
          ) => {

            if (
              !previousSelectedCard ||
              previousSelectedCard.id !==
              card.id
            ) {

              return previousSelectedCard;

            }


            return {

              ...previousSelectedCard,

              ...updateData

            };

          }
        );


        setSuccessMessage(
          `Card status changed to ${newStatus}.`
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error updating card status:",
          error
        );


        setErrorMessage(
          "Unable to update the card status."
        );

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsUpdatingStatus(
            false
          );


          setActionCardId(
            ""
          );

        }

      }

    };


  // ============================================================
  // MARK CARD AS LOST
  // ============================================================

  const markCardAsLost =
    async (
      card
    ) => {

      const confirmed =
        window.confirm(
          `Mark ${card.studentName || "this student's"} ID card as Lost?`
        );


      if (
        !confirmed
      ) {

        return;

      }


      await updateCardStatus(
        card,
        "Lost"
      );

    };


  // ============================================================
  // MARK CARD AS INACTIVE
  // ============================================================

  const markCardAsInactive =
    async (
      card
    ) => {

      const confirmed =
        window.confirm(
          `Mark card ${card.cardNumber || ""} as Inactive?`
        );


      if (
        !confirmed
      ) {

        return;

      }


      await updateCardStatus(
        card,
        "Inactive"
      );

    };


  // ============================================================
  // MARK CARD AS ACTIVE
  // ============================================================

  const markCardAsActive =
    async (
      card
    ) => {

      await updateCardStatus(
        card,
        "Active"
      );

    };


  // ============================================================
  // OPEN DELETE CONFIRMATION
  // ============================================================

  const requestDeleteCard =
    (
      card
    ) => {

      setCardPendingDelete(
        card
      );


      setShowDeleteConfirmation(
        true
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );

    };


  // ============================================================
  // CANCEL DELETE
  // ============================================================

  const cancelDeleteCard =
    () => {

      if (
        isDeleting
      ) {

        return;

      }


      setCardPendingDelete(
        null
      );


      setShowDeleteConfirmation(
        false
      );

    };


  // ============================================================
  // CONFIRM AND DELETE CARD
  // ============================================================

  const confirmDeleteCard =
    async () => {

      if (
        !cardPendingDelete?.id ||
        isDeleting
      ) {

        return;

      }


      setIsDeleting(
        true
      );


      setActionCardId(
        cardPendingDelete.id
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      try {

        const deletedCardId =
          cardPendingDelete.id;


        const deletedStudentName =
          cardPendingDelete.studentName ||
          "Student";


        await deleteDoc(
          doc(
            db,
            "studentIdCards",
            deletedCardId
          )
        );


        // ======================================================
        // REMOVE FROM LOCAL LIST
        // ======================================================

        setIdCards(
          (
            previousCards
          ) =>
            previousCards.filter(
              (
                card
              ) =>
                card.id !==
                deletedCardId
            )
        );


        // ======================================================
        // CLOSE PREVIEW IF DELETED CARD IS OPEN
        // ======================================================

        if (
          selectedCard?.id ===
          deletedCardId
        ) {

          setSelectedCard(
            null
          );


          setShowCardPreview(
            false
          );

        }


        setCardPendingDelete(
          null
        );


        setShowDeleteConfirmation(
          false
        );


        setSuccessMessage(
          `${deletedStudentName}'s ID card was deleted successfully.`
        );

      }
      catch (
        error
      ) {

        console.error(
          "Error deleting ID card:",
          error
        );


        setErrorMessage(
          "Unable to delete the ID card."
        );

      }
      finally {

        if (
          isMountedRef.current
        ) {

          setIsDeleting(
            false
          );


          setActionCardId(
            ""
          );

        }

      }

    };


  // ============================================================
  // CLEAR ALL FILTERS
  // ============================================================

  const clearAllFilters =
    () => {

      setSearchText(
        ""
      );


      setStatusFilter(
        "All"
      );


      setThemeFilter(
        "All"
      );


      setCardTypeFilter(
        "All"
      );


      setSortOption(
        "Newest"
      );

    };


  // ============================================================
  // SAFE FILE NAME
  // ============================================================

  const createSafeFileName =
    (
      card
    ) => {

      const safeStudentName =
        (
          card?.studentName ||
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
          card?.studentId ||
          Date.now().toString()
        )
          .trim()
          .replace(
            /[^a-zA-Z0-9-_]/g,
            ""
          );


      const safeCardNumber =
        (
          card?.cardNumber ||
          "ID-Card"
        )
          .trim()
          .replace(
            /[^a-zA-Z0-9-_]/g,
            ""
          );


      return (
        `${safeStudentName}-${safeStudentId}-${safeCardNumber}`
      );

    };
      // ============================================================
  // VALIDATE SELECTED CARD FOR EXPORT
  // ============================================================

  const validateSelectedCardForExport =
    () => {

      if (
        !selectedCard
      ) {

        setErrorMessage(
          "Please open an ID card before downloading or printing."
        );

        return false;

      }


      if (
        !selectedCard.studentName ||
        !selectedCard.studentId
      ) {

        setErrorMessage(
          "The selected ID card has incomplete student information."
        );

        return false;

      }


      if (
        !cardPreviewRef.current
      ) {

        setErrorMessage(
          "The ID card preview could not be found."
        );

        return false;

      }


      setErrorMessage(
        ""
      );


      return true;

    };


  // ============================================================
  // CAPTURE SAVED CARD AS CANVAS
  // ============================================================

  const captureSelectedCardAsCanvas =
    async () => {

      const cardElement =
        cardPreviewRef.current;


      if (
        !cardElement
      ) {

        throw new Error(
          "The ID card preview could not be found."
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
              selectedCardTheme.background,

            logging:
              false

          }
        );


      return canvas;

    };


  // ============================================================
  // DOWNLOAD SELECTED CARD AS PNG
  // ============================================================

  const downloadSelectedCardPNG =
    async () => {

      if (
        isDownloadingPNG
      ) {

        return;

      }


      const isValid =
        validateSelectedCardForExport();


      if (
        !isValid
      ) {

        return;

      }


      setIsDownloadingPNG(
        true
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      try {

        const canvas =
          await captureSelectedCardAsCanvas();


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
          `${createSafeFileName(
            selectedCard
          )}.png`;


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
          error.message ||
          "Unable to download the ID card PNG."
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
  // DOWNLOAD SELECTED CARD AS PDF
  // ============================================================

  const downloadSelectedCardPDF =
    async () => {

      if (
        isDownloadingPDF
      ) {

        return;

      }


      const isValid =
        validateSelectedCardForExport();


      if (
        !isValid
      ) {

        return;

      }


      setIsDownloadingPDF(
        true
      );


      setSuccessMessage(
        ""
      );


      setErrorMessage(
        ""
      );


      try {

        const canvas =
          await captureSelectedCardAsCanvas();


        const imageData =
          canvas.toDataURL(
            "image/png",
            1.0
          );


        // ======================================================
        // STANDARD CR80 PORTRAIT ID CARD SIZE
        //
        // Width  : 53.98 mm
        // Height : 85.60 mm
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
          `${createSafeFileName(
            selectedCard
          )}.pdf`
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
          error.message ||
          "Unable to download the ID card PDF."
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
  // PRINT SELECTED CARD
  // ============================================================

  const printSelectedCard =
    async () => {

      if (
        isPrinting
      ) {

        return;

      }


      const isValid =
        validateSelectedCardForExport();


      if (
        !isValid
      ) {

        return;

      }


      setIsPrinting(
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
        // CAPTURE PREVIEW AS IMAGE
        // ======================================================

        const canvas =
          await captureSelectedCardAsCanvas();


        const imageData =
          canvas.toDataURL(
            "image/png",
            1.0
          );


        // ======================================================
        // OPEN PRINT WINDOW
        // ======================================================

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
            "Print window was blocked by the browser. Please allow pop-ups."
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
                  ${createSafeFileName(
                    selectedCard
                  )}
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


        // ======================================================
        // WAIT FOR CAPTURED IMAGE TO LOAD
        // ======================================================

        const printImage =
          printWindow.document.getElementById(
            "print-card-image"
          );


        const startPrinting =
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
          printImage &&
          printImage.complete
        ) {

          setTimeout(
            startPrinting,
            300
          );

        }
        else if (
          printImage
        ) {

          printImage.onload =
            () => {

              setTimeout(
                startPrinting,
                300
              );

            };


          printImage.onerror =
            () => {

              printWindow.close();


              setErrorMessage(
                "Unable to prepare the ID card image for printing."
              );

            };

        }
        else {

          printWindow.close();


          throw new Error(
            "Print image could not be created."
          );

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
  // CHECK IF ANY EXPORT ACTION IS RUNNING
  // ============================================================

  const isExporting =
    Boolean(
      isDownloadingPNG ||
      isDownloadingPDF ||
      isPrinting
    );


  // ============================================================
  // CHECK IF ANY CARD ACTION IS RUNNING
  // ============================================================

  const isCardActionRunning =
    Boolean(
      isUpdatingStatus ||
      isDeleting ||
      isExporting
    );


  // ============================================================
  // GET CARD TYPE LABEL
  // ============================================================

  const getCardTypeLabel =
    (
      card
    ) => {

      if (
        !card
      ) {

        return "-";

      }


      if (
        card.isReissued
      ) {

        return "Reissued";

      }


      return "Original";

    };


  // ============================================================
  // GET CARD STATUS COLOR
  // ============================================================

  const getCardStatusColor =
    (
      status
    ) => {

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
        statusColors[
          status
        ] ||
        "#475569"
      );

    };


  // ============================================================
  // GET CARD STATUS BACKGROUND
  // ============================================================

  const getCardStatusBackground =
    (
      status
    ) => {

      const statusBackgrounds = {

        Active:
          "#dcfce7",

        Inactive:
          "#f1f5f9",

        Expired:
          "#fef3c7",

        Lost:
          "#fee2e2",

        Reissued:
          "#f3e8ff"

      };


      return (
        statusBackgrounds[
          status
        ] ||
        "#f1f5f9"
      );

    };


  // ============================================================
  // CHECK WHETHER FILTERS ARE ACTIVE
  // ============================================================

  const hasActiveFilters =
    Boolean(
      searchText ||
      statusFilter !==
        "All" ||
      themeFilter !==
        "All" ||
      cardTypeFilter !==
        "All" ||
      sortOption !==
        "Newest"
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
              👀 View Student ID Cards
            </h1>


            <p
              style={{
                margin:
                  0,

                color:
                  "#64748b"
              }}
            >
              Search, manage, download, print and update generated student ID cards.
            </p>

          </div>


          <button
            type="button"
            onClick={
              fetchIDCards
            }
            disabled={
              loading ||
              isCardActionRunning
            }
          >

            {
              loading
                ?
                "⏳ Loading..."
                :
                "🔄 Refresh Cards"
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
            DASHBOARD STATISTICS
        ====================================================== */}

        <div className="attendance-summary">

          <div className="summary-card">

            <h2>
              🪪
            </h2>

            <p>
              Total Cards
            </p>

            <h3>
              {
                cardStatistics.totalCards
              }
            </h3>

          </div>


          <div className="summary-card">

            <h2>
              ✅
            </h2>

            <p>
              Active Cards
            </p>

            <h3>
              {
                cardStatistics.activeCards
              }
            </h3>

          </div>


          <div className="summary-card">

            <h2>
              🔄
            </h2>

            <p>
              Reissued Cards
            </p>

            <h3>
              {
                cardStatistics.reissuedCards
              }
            </h3>

          </div>


          <div className="summary-card">

            <h2>
              ⚠️
            </h2>

            <p>
              Lost Cards
            </p>

            <h3>
              {
                cardStatistics.lostCards
              }
            </h3>

          </div>

        </div>


        {/* ======================================================
            SEARCH AND FILTER SECTION
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
              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                "14px",

              flexWrap:
                "wrap",

              marginBottom:
                "20px"
            }}
          >

            <div>

              <h2
                style={{
                  margin:
                    "0 0 6px 0"
                }}
              >
                🔎 Search & Filter
              </h2>


              <p
                style={{
                  margin:
                    0,

                  color:
                    "#64748b"
                }}
              >
                Find cards by student name, student ID, card number, class or mobile number.
              </p>

            </div>


            {
              hasActiveFilters && (

                <button
                  type="button"
                  onClick={
                    clearAllFilters
                  }
                  disabled={
                    isCardActionRunning
                  }
                >
                  ✖ Clear Filters
                </button>

              )
            }

          </div>


          {/* ====================================================
              SEARCH BOX
          ==================================================== */}

          <div
            style={{
              marginBottom:
                "18px"
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
              Search ID Cards
            </label>


            <input
              type="text"
              value={
                searchText
              }
              onChange={
                (
                  event
                ) =>
                  setSearchText(
                    event.target.value
                  )
              }
              placeholder="Search student name, student ID, admission number, card number..."
              style={{
                width:
                  "100%"
              }}
            />

          </div>


          {/* ====================================================
              FILTER CONTROLS
          ==================================================== */}

          <div className="form-grid">

            {/* ==================================================
                STATUS FILTER
            ================================================== */}

            <div>

              <label>
                Card Status
              </label>


              <select
                value={
                  statusFilter
                }
                onChange={
                  (
                    event
                  ) =>
                    setStatusFilter(
                      event.target.value
                    )
                }
              >

                <option value="All">
                  All Statuses
                </option>

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


            {/* ==================================================
                THEME FILTER
            ================================================== */}

            <div>

              <label>
                Card Theme
              </label>


              <select
                value={
                  themeFilter
                }
                onChange={
                  (
                    event
                  ) =>
                    setThemeFilter(
                      event.target.value
                    )
                }
              >

                <option value="All">
                  All Themes
                </option>


                {
                  availableThemes.map(
                    (
                      themeName
                    ) => (

                      <option
                        key={
                          themeName
                        }
                        value={
                          themeName
                        }
                      >
                        {
                          themeName
                        }
                      </option>

                    )
                  )
                }

              </select>

            </div>


            {/* ==================================================
                ORIGINAL / REISSUED FILTER
            ================================================== */}

            <div>

              <label>
                Card Type
              </label>


              <select
                value={
                  cardTypeFilter
                }
                onChange={
                  (
                    event
                  ) =>
                    setCardTypeFilter(
                      event.target.value
                    )
                }
              >

                <option value="All">
                  All Cards
                </option>

                <option value="Original">
                  Original Cards
                </option>

                <option value="Reissued">
                  Reissued Cards
                </option>

              </select>

            </div>


            {/* ==================================================
                SORT OPTION
            ================================================== */}

            <div>

              <label>
                Sort Cards
              </label>


              <select
                value={
                  sortOption
                }
                onChange={
                  (
                    event
                  ) =>
                    setSortOption(
                      event.target.value
                    )
                }
              >

                <option value="Newest">
                  Newest First
                </option>

                <option value="Oldest">
                  Oldest First
                </option>

                <option value="Student Name">
                  Student Name
                </option>

                <option value="Card Version">
                  Highest Version
                </option>

              </select>

            </div>

          </div>


          {/* ====================================================
              RESULT COUNT
          ==================================================== */}

          <div
            style={{
              marginTop:
                "18px",

              paddingTop:
                "16px",

              borderTop:
                "1px solid #e2e8f0",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap:
                "12px",

              flexWrap:
                "wrap"
            }}
          >

            <p
              style={{
                margin:
                  0,

                color:
                  "#475569",

                fontWeight:
                  "600"
              }}
            >
              Showing
              {" "}
              {
                filteredIDCards.length
              }
              {" "}
              of
              {" "}
              {
                idCards.length
              }
              {" "}
              ID Cards
            </p>


            {
              hasActiveFilters && (

                <span
                  style={{
                    padding:
                      "5px 10px",

                    borderRadius:
                      "999px",

                    background:
                      "#eff6ff",

                    color:
                      "#1d4ed8",

                    fontSize:
                      "12px",

                    fontWeight:
                      "700"
                  }}
                >
                  Filters Active
                </span>

              )
            }

          </div>

        </div>


        {/* ======================================================
            LOADING STATE
        ====================================================== */}

        {
          loading && (

            <div
              className="section-card"
              style={{
                marginTop:
                  "24px",

                padding:
                  "40px 20px",

                textAlign:
                  "center"
              }}
            >

              <div
                style={{
                  fontSize:
                    "42px",

                  marginBottom:
                    "12px"
                }}
              >
                ⏳
              </div>


              <h2>
                Loading Student ID Cards...
              </h2>


              <p
                style={{
                  color:
                    "#64748b"
                }}
              >
                Please wait while the saved ID cards are loaded from Firestore.
              </p>

            </div>

          )
        }


        {/* ======================================================
            EMPTY DATABASE STATE
        ====================================================== */}

        {
          !loading &&
          idCards.length === 0 && (

            <div
              className="section-card"
              style={{
                marginTop:
                  "24px",

                padding:
                  "45px 20px",

                textAlign:
                  "center"
              }}
            >

              <div
                style={{
                  fontSize:
                    "52px",

                  marginBottom:
                    "14px"
                }}
              >
                🪪
              </div>


              <h2>
                No Student ID Cards Found
              </h2>


              <p
                style={{
                  maxWidth:
                    "520px",

                  margin:
                    "8px auto 0",

                  color:
                    "#64748b",

                  lineHeight:
                    "1.6"
                }}
              >
                Generate and save a student ID card first. Saved cards will automatically appear here.
              </p>

            </div>

          )
        }


        {/* ======================================================
            NO FILTER RESULTS
        ====================================================== */}

        {
          !loading &&
          idCards.length > 0 &&
          filteredIDCards.length === 0 && (

            <div
              className="section-card"
              style={{
                marginTop:
                  "24px",

                padding:
                  "40px 20px",

                textAlign:
                  "center"
              }}
            >

              <div
                style={{
                  fontSize:
                    "46px",

                  marginBottom:
                    "12px"
                }}
              >
                🔍
              </div>


              <h2>
                No Matching ID Cards
              </h2>


              <p
                style={{
                  color:
                    "#64748b"
                }}
              >
                Try changing the search text or filters.
              </p>


              <button
                type="button"
                onClick={
                  clearAllFilters
                }
                style={{
                  marginTop:
                    "12px"
                }}
              >
                ✖ Clear All Filters
              </button>

            </div>

          )
        }


        {/* ======================================================
            REAL ID CARD LIST
        ====================================================== */}

        {
          !loading &&
          filteredIDCards.length > 0 && (

            <div
              style={{
                marginTop:
                  "24px"
              }}
            >

              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "space-between",

                  gap:
                    "12px",

                  flexWrap:
                    "wrap",

                  marginBottom:
                    "16px"
                }}
              >

                <div>

                  <h2
                    style={{
                      margin:
                        "0 0 5px"
                    }}
                  >
                    🪪 Saved Student ID Cards
                  </h2>


                  <p
                    style={{
                      margin:
                        0,

                      color:
                        "#64748b"
                    }}
                  >
                    Open any card to view the full premium preview and export options.
                  </p>

                </div>

              </div>


              {/* ==================================================
                  CARDS GRID
              ================================================== */}

              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(300px, 1fr))",

                  gap:
                    "18px"
                }}
              >

                {
                  filteredIDCards.map(
                    (
                      card
                    ) => {

                      const cardIsBusy =
                        actionCardId ===
                        card.id;


                      const statusColor =
                        getCardStatusColor(
                          card.cardStatus
                        );


                      const statusBackground =
                        getCardStatusBackground(
                          card.cardStatus
                        );


                      return (

                        <div
                          key={
                            card.id
                          }
                          className="section-card"
                          style={{
                            margin:
                              0,

                            padding:
                              "20px",

                            position:
                              "relative",

                            overflow:
                              "hidden"
                          }}
                        >

                          {/* ======================================
                              TOP ACCENT LINE
                          ====================================== */}

                          <div
                            style={{
                              position:
                                "absolute",

                              top:
                                0,

                              left:
                                0,

                              right:
                                0,

                              height:
                                "5px",

                              background:
                                card.themeSnapshot?.primaryColor ||
                                "#076b55"
                            }}
                          />


                          {/* ======================================
                              STUDENT TOP INFORMATION
                          ====================================== */}

                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                "14px",

                              marginBottom:
                                "18px"
                            }}
                          >

                            <div
                              style={{
                                width:
                                  "62px",

                                height:
                                  "62px",

                                flexShrink:
                                  0,

                                overflow:
                                  "hidden",

                                borderRadius:
                                  "50%",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                background:
                                  "#e2e8f0",

                                border:
                                  "3px solid #ffffff",

                                boxShadow:
                                  "0 3px 10px rgba(15, 23, 42, 0.15)"
                              }}
                            >

                              {
                                card.photoUrl
                                  ? (

                                    <img
                                      src={
                                        card.photoUrl
                                      }
                                      alt={
                                        card.studentName ||
                                        "Student"
                                      }
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
                                          "28px"
                                      }}
                                    >
                                      👨‍🎓
                                    </span>

                                  )
                              }

                            </div>


                            <div
                              style={{
                                minWidth:
                                  0,

                                flex:
                                  1
                              }}
                            >

                              <h3
                                style={{
                                  margin:
                                    "0 0 5px",

                                  wordBreak:
                                    "break-word"
                                }}
                              >
                                {
                                  displayValue(
                                    card.studentName,
                                    "Unnamed Student"
                                  )
                                }
                              </h3>


                              <p
                                style={{
                                  margin:
                                    "0 0 7px",

                                  color:
                                    "#64748b",

                                  fontSize:
                                    "13px"
                                }}
                              >
                                {
                                  displayValue(
                                    card.studentId,
                                    "No Student ID"
                                  )
                                }
                              </p>


                              <div
                                style={{
                                  display:
                                    "flex",

                                  gap:
                                    "7px",

                                  flexWrap:
                                    "wrap"
                                }}
                              >

                                <span
                                  style={{
                                    padding:
                                      "4px 9px",

                                    borderRadius:
                                      "999px",

                                    background:
                                      statusBackground,

                                    color:
                                      statusColor,

                                    fontSize:
                                      "11px",

                                    fontWeight:
                                      "800"
                                  }}
                                >
                                  {
                                    card.cardStatus ||
                                    "Active"
                                  }
                                </span>


                                <span
                                  style={{
                                    padding:
                                      "4px 9px",

                                    borderRadius:
                                      "999px",

                                    background:
                                      "#eff6ff",

                                    color:
                                      "#1d4ed8",

                                    fontSize:
                                      "11px",

                                    fontWeight:
                                      "800"
                                  }}
                                >
                                  {
                                    getCardTypeLabel(
                                      card
                                    )
                                  }
                                </span>

                              </div>

                            </div>

                          </div>


                          {/* ======================================
                              CARD DETAILS
                          ====================================== */}

                          <div
                            style={{
                              display:
                                "grid",

                              gridTemplateColumns:
                                "1fr 1fr",

                              gap:
                                "10px",

                              marginBottom:
                                "18px"
                            }}
                          >

                            <div>

                              <strong
                                style={{
                                  fontSize:
                                    "12px"
                                }}
                              >
                                Card Number
                              </strong>

                              <p
                                style={{
                                  margin:
                                    "4px 0 0",

                                  color:
                                    "#64748b",

                                  fontSize:
                                    "12px",

                                  wordBreak:
                                    "break-word"
                                }}
                              >
                                {
                                  displayValue(
                                    card.cardNumber
                                  )
                                }
                              </p>

                            </div>


                            <div>

                              <strong
                                style={{
                                  fontSize:
                                    "12px"
                                }}
                              >
                                Class
                              </strong>

                              <p
                                style={{
                                  margin:
                                    "4px 0 0",

                                  color:
                                    "#64748b",

                                  fontSize:
                                    "12px"
                                }}
                              >
                                {
                                  displayValue(
                                    card.studentClass
                                  )
                                }
                              </p>

                            </div>


                            <div>

                              <strong
                                style={{
                                  fontSize:
                                    "12px"
                                }}
                              >
                                Version
                              </strong>

                              <p
                                style={{
                                  margin:
                                    "4px 0 0",

                                  color:
                                    "#64748b",

                                  fontSize:
                                    "12px"
                                }}
                              >
                                {
                                  card.cardVersion ||
                                  1
                                }
                              </p>

                            </div>


                            <div>

                              <strong
                                style={{
                                  fontSize:
                                    "12px"
                                }}
                              >
                                Theme
                              </strong>

                              <p
                                style={{
                                  margin:
                                    "4px 0 0",

                                  color:
                                    "#64748b",

                                  fontSize:
                                    "12px"
                                }}
                              >
                                {
                                  displayValue(
                                    card.cardTheme,
                                    "Makkah"
                                  )
                                }
                              </p>

                            </div>


                            <div>

                              <strong
                                style={{
                                  fontSize:
                                    "12px"
                                }}
                              >
                                Issue Date
                              </strong>

                              <p
                                style={{
                                  margin:
                                    "4px 0 0",

                                  color:
                                    "#64748b",

                                  fontSize:
                                    "12px"
                                }}
                              >
                                {
                                  formatDate(
                                    card.issueDate
                                  )
                                }
                              </p>

                            </div>


                            <div>

                              <strong
                                style={{
                                  fontSize:
                                    "12px"
                                }}
                              >
                                Expiry Date
                              </strong>

                              <p
                                style={{
                                  margin:
                                    "4px 0 0",

                                  color:
                                    "#64748b",

                                  fontSize:
                                    "12px"
                                }}
                              >
                                {
                                  card.expiryDate
                                    ?
                                    formatDate(
                                      card.expiryDate
                                    )
                                    :
                                    "Not Set"
                                }
                              </p>

                            </div>

                          </div>


                          {/* ======================================
                              PRIMARY ACTION
                          ====================================== */}

                          <button
                            type="button"
                            onClick={
                              () =>
                                openCardPreview(
                                  card
                                )
                            }
                            disabled={
                              cardIsBusy ||
                              isCardActionRunning
                            }
                            style={{
                              width:
                                "100%",

                              marginBottom:
                                "10px"
                            }}
                          >
                            👀 View Full ID Card
                          </button>


                          {/* ======================================
                              STATUS ACTIONS
                          ====================================== */}

                          <div
                            style={{
                              display:
                                "flex",

                              gap:
                                "8px",

                              flexWrap:
                                "wrap"
                            }}
                          >

                            {
                              card.cardStatus !==
                                "Active" && (

                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      markCardAsActive(
                                        card
                                      )
                                  }
                                  disabled={
                                    cardIsBusy ||
                                    isCardActionRunning
                                  }
                                >
                                  ✅ Active
                                </button>

                              )
                            }


                            {
                              card.cardStatus !==
                                "Inactive" && (

                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      markCardAsInactive(
                                        card
                                      )
                                  }
                                  disabled={
                                    cardIsBusy ||
                                    isCardActionRunning
                                  }
                                >
                                  ⏸ Inactive
                                </button>

                              )
                            }


                            {
                              card.cardStatus !==
                                "Lost" && (

                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      markCardAsLost(
                                        card
                                      )
                                  }
                                  disabled={
                                    cardIsBusy ||
                                    isCardActionRunning
                                  }
                                >
                                  ⚠️ Lost
                                </button>

                              )
                            }


                            <button
                              type="button"
                              onClick={
                                () =>
                                  requestDeleteCard(
                                    card
                                  )
                              }
                              disabled={
                                cardIsBusy ||
                                isCardActionRunning
                              }
                            >
                              🗑 Delete
                            </button>

                          </div>


                          {/* ======================================
                              ACTION LOADING MESSAGE
                          ====================================== */}

                          {
                            cardIsBusy && (

                              <p
                                style={{
                                  margin:
                                    "12px 0 0",

                                  color:
                                    "#64748b",

                                  fontSize:
                                    "12px",

                                  fontWeight:
                                    "600"
                                }}
                              >
                                ⏳ Processing card action...
                              </p>

                            )
                          }

                        </div>

                      );

                    }
                  )
                }

              </div>

            </div>

          )
        }
                {/* ======================================================
            FULL SELECTED CARD PREVIEW SECTION
        ====================================================== */}

        {
          showCardPreview &&
          selectedCard && (

            <div
              style={{
                marginTop:
                  "36px"
              }}
            >

              {/* ==================================================
                  PREVIEW HEADER
              ================================================== */}

              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "space-between",

                  gap:
                    "14px",

                  flexWrap:
                    "wrap",

                  marginBottom:
                    "20px"
                }}
              >

                <div>

                  <h2
                    style={{
                      margin:
                        "0 0 6px"
                    }}
                  >
                    🪪 Full Student ID Card
                  </h2>


                  <p
                    style={{
                      margin:
                        0,

                      color:
                        "#64748b"
                    }}
                  >
                    View, download, print and manage the selected saved ID card.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    closeCardPreview
                  }
                  disabled={
                    isCardActionRunning
                  }
                >
                  ✖ Close Preview
                </button>

              </div>


              {/* ==================================================
                  SELECTED CARD SUMMARY
              ================================================== */}

              <div
                className="attendance-summary"
                style={{
                  marginBottom:
                    "24px"
                }}
              >

                <div className="summary-card">

                  <h2>
                    👨‍🎓
                  </h2>

                  <p>
                    {
                      displayValue(
                        selectedCard.studentId,
                        "No Student ID"
                      )
                    }
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    🪪
                  </h2>

                  <p>
                    {
                      displayValue(
                        selectedCard.cardNumber,
                        "No Card Number"
                      )
                    }
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    🔢
                  </h2>

                  <p>
                    Version
                    {" "}
                    {
                      selectedCard.cardVersion ||
                      1
                    }
                  </p>

                </div>


                <div className="summary-card">

                  <h2>
                    {
                      selectedCard.cardStatus ===
                        "Active"
                        ?
                        "✅"
                        :
                      selectedCard.cardStatus ===
                        "Lost"
                        ?
                        "⚠️"
                        :
                        "🪪"
                    }
                  </h2>

                  <p>
                    {
                      selectedCard.cardStatus ||
                      "Active"
                    }
                  </p>

                </div>

              </div>


              {/* ==================================================
                  PREMIUM SAVED ID CARD
              ================================================== */}

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
                    cardPreviewRef
                  }
                  id="saved-student-id-card"
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
                      selectedCardTheme.background,

                    color:
                      selectedCardTheme.text,

                    boxShadow:
                      "0 18px 45px rgba(15, 23, 42, 0.24)",

                    border:
                      `2px solid ${selectedCardTheme.accent}`,

                    fontFamily:
                      "Arial, Helvetica, sans-serif"
                  }}
                >

                  {/* ==============================================
                      DECORATIVE BACKGROUND
                  ============================================== */}

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
                        `35px solid ${selectedCardTheme.accent}`,

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
                        `40px solid ${selectedCardTheme.primary}`,

                      opacity:
                        "0.06",

                      pointerEvents:
                        "none"
                    }}
                  />


                  {/* ==============================================
                      CARD HEADER
                  ============================================== */}

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
                        selectedCardTheme.headerGradient,

                      borderBottom:
                        `4px solid ${selectedCardTheme.accent}`
                    }}
                  >

                    {/* ============================================
                        DECORATION
                    ============================================ */}

                    <div
                      style={{
                        position:
                          "absolute",

                        top:
                          "10px",

                        left:
                          "16px",

                        color:
                          selectedCardTheme.accent,

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
                          selectedCardTheme.accent,

                        opacity:
                          "0.9",

                        fontSize:
                          "18px"
                      }}
                    >
                      ✦
                    </div>


                    {/* ============================================
                        MADRASA LOGO
                    ============================================ */}

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
                          `3px solid ${selectedCardTheme.accent}`,

                        boxShadow:
                          "0 5px 14px rgba(0, 0, 0, 0.18)"
                      }}
                    >

                      {
                        selectedCard.madrasaLogo
                          ? (

                            <img
                              src={
                                selectedCard.madrasaLogo
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


                    {/* ============================================
                        MADRASA NAME
                    ============================================ */}

                    <h2
                      style={{
                        margin:
                          0,

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
                        selectedCard.madrasaName ||
                        "MA MADRASA ERP"
                      }
                    </h2>


                    {/* ============================================
                        SUBTITLE
                    ============================================ */}

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
                        selectedCard.madrasaSubtitle ||
                        "Student Identity Card"
                      }
                    </p>


                    {/* ============================================
                        ACADEMIC YEAR
                    ============================================ */}

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
                        selectedCard.academicYear ||
                        "-"
                      }
                    </div>

                  </div>


                  {/* ==============================================
                      STUDENT PHOTO
                  ============================================== */}

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
                        `5px solid ${selectedCardTheme.accent}`,

                      boxShadow:
                        "0 7px 20px rgba(15, 23, 42, 0.22)"
                    }}
                  >

                    {
                      selectedCard.photoUrl
                        ? (

                          <img
                            src={
                              selectedCard.photoUrl
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
                                  ${selectedCardTheme.primary},
                                  ${selectedCardTheme.secondary}
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
                              selectedStudentInitials
                            }
                          </div>

                        )
                    }

                  </div>


                  {/* ==============================================
                      STUDENT NAME AND STATUS
                  ============================================== */}

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
                          0,

                        color:
                          selectedCardTheme.primary,

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
                          selectedCard.studentName,
                          "Student Name"
                        )
                      }
                    </h2>


                    <div
                      style={{
                        display:
                          "inline-block",

                        marginTop:
                          "7px",

                        padding:
                          "5px 13px",

                        borderRadius:
                          "999px",

                        background:
                          selectedCardStatusColor,

                        color:
                          "#ffffff",

                        fontSize:
                          "11px",

                        fontWeight:
                          "800",

                        letterSpacing:
                          "0.5px"
                      }}
                    >
                      {
                        selectedCard.cardStatus ||
                        "Active"
                      }
                    </div>

                  </div>


                  {/* ==============================================
                      STUDENT DETAIL GRID
                  ============================================== */}

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

                      {/* ==========================================
                          STUDENT ID
                      ========================================== */}

                      <div
                        style={{
                          padding:
                            "10px",

                          borderRadius:
                            "10px",

                          background:
                            `${selectedCardTheme.primary}0D`,

                          border:
                            `1px solid ${selectedCardTheme.primary}22`
                        }}
                      >

                        <div
                          style={{
                            marginBottom:
                              "3px",

                            color:
                              selectedCardTheme.mutedText,

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
                              selectedCardTheme.text,

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
                              selectedCard.studentId
                            )
                          }
                        </div>

                      </div>


                      {/* ==========================================
                          ADMISSION NUMBER
                      ========================================== */}

                      <div
                        style={{
                          padding:
                            "10px",

                          borderRadius:
                            "10px",

                          background:
                            `${selectedCardTheme.primary}0D`,

                          border:
                            `1px solid ${selectedCardTheme.primary}22`
                        }}
                      >

                        <div
                          style={{
                            marginBottom:
                              "3px",

                            color:
                              selectedCardTheme.mutedText,

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
                              selectedCardTheme.text,

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
                              selectedCard.admissionNumber
                            )
                          }
                        </div>

                      </div>


                      {/* ==========================================
                          CLASS
                      ========================================== */}

                      <div
                        style={{
                          padding:
                            "10px",

                          borderRadius:
                            "10px",

                          background:
                            `${selectedCardTheme.primary}0D`,

                          border:
                            `1px solid ${selectedCardTheme.primary}22`
                        }}
                      >

                        <div
                          style={{
                            marginBottom:
                              "3px",

                            color:
                              selectedCardTheme.mutedText,

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
                              selectedCardTheme.text,

                            fontSize:
                              "12px",

                            fontWeight:
                              "800"
                          }}
                        >
                          {
                            displayValue(
                              selectedCard.studentClass
                            )
                          }
                        </div>

                      </div>


                      {/* ==========================================
                          BLOOD GROUP
                      ========================================== */}

                      <div
                        style={{
                          padding:
                            "10px",

                          borderRadius:
                            "10px",

                          background:
                            `${selectedCardTheme.primary}0D`,

                          border:
                            `1px solid ${selectedCardTheme.primary}22`
                        }}
                      >

                        <div
                          style={{
                            marginBottom:
                              "3px",

                            color:
                              selectedCardTheme.mutedText,

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
                              selectedCard.bloodGroup
                            )
                          }
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* ==============================================
                      QR AND CARD INFORMATION
                  ============================================== */}

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

                    {/* ============================================
                        QR CODE
                    ============================================ */}

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
                          `2px solid ${selectedCardTheme.accent}`
                      }}
                    >

                      <QRCodeCanvas
                        value={
                          selectedCardQRValue
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


                    {/* ============================================
                        CARD NUMBER AND DATES
                    ============================================ */}

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
                              selectedCardTheme.mutedText,

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
                              selectedCardTheme.text,

                            fontSize:
                              "11px",

                            fontWeight:
                              "800",

                            wordBreak:
                              "break-word"
                          }}
                        >
                          {
                            displayValue(
                              selectedCard.cardNumber
                            )
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
                              selectedCardTheme.mutedText,

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
                              selectedCardTheme.text,

                            fontSize:
                              "11px",

                            fontWeight:
                              "700"
                          }}
                        >
                          {
                            formatDate(
                              selectedCard.issueDate
                            )
                          }
                        </div>

                      </div>


                      <div>

                        <div
                          style={{
                            color:
                              selectedCardTheme.mutedText,

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
                              selectedCardTheme.text,

                            fontSize:
                              "11px",

                            fontWeight:
                              "700"
                          }}
                        >
                          {
                            selectedCard.expiryDate
                              ?
                              formatDate(
                                selectedCard.expiryDate
                              )
                              :
                              "Not Set"
                          }
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* ==============================================
                      CARD FOOTER
                  ============================================== */}

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
                        selectedCardTheme.headerGradient,

                      borderTop:
                        `3px solid ${selectedCardTheme.accent}`,

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
                        selectedCard.madrasaName ||
                        "MA MADRASA ERP"
                      }
                    </div>


                    {
                      (
                        selectedCard.madrasaMobile ||
                        selectedCard.madrasaAddress
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
                            selectedCard.madrasaMobile &&
                            (
                              <span>
                                {
                                  selectedCard.madrasaMobile
                                }
                              </span>
                            )
                          }


                          {
                            selectedCard.madrasaMobile &&
                            selectedCard.madrasaAddress &&
                            (
                              <span>
                                {" • "}
                              </span>
                            )
                          }


                          {
                            selectedCard.madrasaAddress &&
                            (
                              <span>
                                {
                                  selectedCard.madrasaAddress
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


              {/* ==================================================
                  EXPORT ACTION SECTION
              ================================================== */}

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
                    📤 Export Saved ID Card
                  </h2>


                  <p
                    style={{
                      margin:
                        0,

                      color:
                        "#64748b"
                    }}
                  >
                    Download or print this saved student identity card.
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

                  <button
                    type="button"
                    onClick={
                      downloadSelectedCardPNG
                    }
                    disabled={
                      isExporting
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


                  <button
                    type="button"
                    onClick={
                      downloadSelectedCardPDF
                    }
                    disabled={
                      isExporting
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


                  <button
                    type="button"
                    onClick={
                      printSelectedCard
                    }
                    disabled={
                      isExporting
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

                </div>

              </div>

            </div>

          )
        }
                {/* ======================================================
            SELECTED CARD MANAGEMENT PANEL
        ====================================================== */}

        {
          showCardPreview &&
          selectedCard && (

            <div
              style={{
                maxWidth: "760px",
                margin: "24px auto 0",
                padding: "22px",
                borderRadius: "16px",
                background: "#ffffff",
                boxShadow: "0 8px 25px rgba(15, 23, 42, 0.08)"
              }}
            >

              <div
                style={{
                  marginBottom: "18px"
                }}
              >

                <h2
                  style={{
                    margin: "0 0 6px"
                  }}
                >
                  ⚙️ Manage ID Card
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Change the status or delete the selected saved ID card.
                </p>

              </div>


              {/* ==================================================
                  STATUS ACTION BUTTONS
              ================================================== */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap"
                }}
              >

                {
                  selectedCard.cardStatus !== "Active" && (

                    <button
                      type="button"
                      onClick={
                        () =>
                          markCardAsActive(
                            selectedCard
                          )
                      }
                      disabled={
                        isCardActionRunning
                      }
                    >
                      {
                        isUpdatingStatus &&
                        actionCardId === selectedCard.id
                          ?
                          "⏳ Updating..."
                          :
                          "✅ Mark Active"
                      }
                    </button>

                  )
                }


                {
                  selectedCard.cardStatus !== "Inactive" && (

                    <button
                      type="button"
                      onClick={
                        () =>
                          markCardAsInactive(
                            selectedCard
                          )
                      }
                      disabled={
                        isCardActionRunning
                      }
                    >
                      {
                        isUpdatingStatus &&
                        actionCardId === selectedCard.id
                          ?
                          "⏳ Updating..."
                          :
                          "⏸ Mark Inactive"
                      }
                    </button>

                  )
                }


                {
                  selectedCard.cardStatus !== "Lost" && (

                    <button
                      type="button"
                      onClick={
                        () =>
                          markCardAsLost(
                            selectedCard
                          )
                      }
                      disabled={
                        isCardActionRunning
                      }
                    >
                      {
                        isUpdatingStatus &&
                        actionCardId === selectedCard.id
                          ?
                          "⏳ Updating..."
                          :
                          "⚠️ Mark Lost"
                      }
                    </button>

                  )
                }


                <button
                  type="button"
                  onClick={
                    () =>
                      requestDeleteCard(
                        selectedCard
                      )
                  }
                  disabled={
                    isCardActionRunning
                  }
                  style={{
                    background: "#dc2626",
                    color: "#ffffff"
                  }}
                >
                  🗑 Delete ID Card
                </button>

              </div>

            </div>

          )
        }


        {/* ======================================================
            SELECTED CARD COMPLETE INFORMATION
        ====================================================== */}

        {
          showCardPreview &&
          selectedCard && (

            <div
              style={{
                maxWidth: "760px",
                margin: "24px auto 0",
                padding: "22px",
                borderRadius: "16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0"
              }}
            >

              <div
                style={{
                  marginBottom: "20px"
                }}
              >

                <h2
                  style={{
                    margin: "0 0 6px"
                  }}
                >
                  📋 Saved Card Information
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b"
                  }}
                >
                  Complete information stored for this student ID card.
                </p>

              </div>


              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "18px"
                }}
              >

                {/* ==================================================
                    STUDENT NAME
                ================================================== */}

                <div>

                  <strong>
                    Student Name
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.studentName
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    STUDENT ID
                ================================================== */}

                <div>

                  <strong>
                    Student ID
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.studentId
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    ADMISSION NUMBER
                ================================================== */}

                <div>

                  <strong>
                    Admission Number
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.admissionNumber
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    FATHER NAME
                ================================================== */}

                <div>

                  <strong>
                    Father Name
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.fatherName
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    MOBILE NUMBER
                ================================================== */}

                <div>

                  <strong>
                    Mobile Number
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.mobileNumber
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    CLASS
                ================================================== */}

                <div>

                  <strong>
                    Class
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.studentClass
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    BLOOD GROUP
                ================================================== */}

                <div>

                  <strong>
                    Blood Group
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.bloodGroup
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    DATE OF BIRTH
                ================================================== */}

                <div>

                  <strong>
                    Date of Birth
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      selectedCard.dateOfBirth
                        ?
                        formatDate(
                          selectedCard.dateOfBirth
                        )
                        :
                        "-"
                    }
                  </p>

                </div>


                {/* ==================================================
                    CARD NUMBER
                ================================================== */}

                <div>

                  <strong>
                    Card Number
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b",
                      wordBreak: "break-word"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.cardNumber
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    CARD VERSION
                ================================================== */}

                <div>

                  <strong>
                    Card Version
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      selectedCard.cardVersion ||
                      1
                    }
                  </p>

                </div>


                {/* ==================================================
                    CARD TYPE
                ================================================== */}

                <div>

                  <strong>
                    Card Type
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      getCardTypeLabel(
                        selectedCard
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    CARD STATUS
                ================================================== */}

                <div>

                  <strong>
                    Card Status
                  </strong>

                  <div
                    style={{
                      marginTop: "7px"
                    }}
                  >

                    <span
                      style={{
                        display: "inline-block",
                        padding: "5px 10px",
                        borderRadius: "999px",
                        background:
                          getCardStatusBackground(
                            selectedCard.cardStatus
                          ),
                        color:
                          getCardStatusColor(
                            selectedCard.cardStatus
                          ),
                        fontSize: "12px",
                        fontWeight: "800"
                      }}
                    >
                      {
                        selectedCard.cardStatus ||
                        "Active"
                      }
                    </span>

                  </div>

                </div>


                {/* ==================================================
                    CARD THEME
                ================================================== */}

                <div>

                  <strong>
                    Card Theme
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.cardTheme,
                        "Makkah"
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    ACADEMIC YEAR
                ================================================== */}

                <div>

                  <strong>
                    Academic Year
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.academicYear
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    ISSUE DATE
                ================================================== */}

                <div>

                  <strong>
                    Issue Date
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      formatDate(
                        selectedCard.issueDate
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    EXPIRY DATE
                ================================================== */}

                <div>

                  <strong>
                    Expiry Date
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      selectedCard.expiryDate
                        ?
                        formatDate(
                          selectedCard.expiryDate
                        )
                        :
                        "Not Set"
                    }
                  </p>

                </div>


                {/* ==================================================
                    MADRASA NAME
                ================================================== */}

                <div>

                  <strong>
                    Madrasa Name
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.madrasaName,
                        "MA Madrasa ERP"
                      )
                    }
                  </p>

                </div>


                {/* ==================================================
                    MADRASA MOBILE
                ================================================== */}

                <div>

                  <strong>
                    Madrasa Mobile
                  </strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#64748b"
                    }}
                  >
                    {
                      displayValue(
                        selectedCard.madrasaMobile
                      )
                    }
                  </p>

                </div>

              </div>


              {/* ==================================================
                  MADRASA ADDRESS
              ================================================== */}

              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "18px",
                  borderTop: "1px solid #e2e8f0"
                }}
              >

                <strong>
                  Madrasa Address
                </strong>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                    lineHeight: "1.6"
                  }}
                >
                  {
                    displayValue(
                      selectedCard.madrasaAddress
                    )
                  }
                </p>

              </div>

            </div>

          )
        }


        {/* ======================================================
            DELETE CONFIRMATION OVERLAY
        ====================================================== */}

        {
          showDeleteConfirmation &&
          cardPendingDelete && (

            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: "rgba(15, 23, 42, 0.65)"
              }}
            >

              {/* ==================================================
                  DELETE CONFIRMATION BOX
              ================================================== */}

              <div
                style={{
                  width: "100%",
                  maxWidth: "460px",
                  padding: "26px",
                  borderRadius: "18px",
                  background: "#ffffff",
                  boxShadow:
                    "0 24px 70px rgba(15, 23, 42, 0.35)"
                }}
              >

                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    margin: "0 auto 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "#fee2e2",
                    fontSize: "30px"
                  }}
                >
                  🗑
                </div>


                <h2
                  style={{
                    margin: "0 0 10px",
                    textAlign: "center"
                  }}
                >
                  Delete ID Card?
                </h2>


                <p
                  style={{
                    margin: "0",
                    textAlign: "center",
                    color: "#64748b",
                    lineHeight: "1.6"
                  }}
                >
                  You are about to permanently delete the saved ID card for
                  {" "}
                  <strong>
                    {
                      cardPendingDelete.studentName ||
                      "this student"
                    }
                  </strong>
                  .
                </p>


                <div
                  style={{
                    marginTop: "18px",
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0"
                  }}
                >

                  <p
                    style={{
                      margin: "0 0 5px",
                      fontSize: "13px"
                    }}
                  >
                    <strong>
                      Student ID:
                    </strong>
                    {" "}
                    {
                      displayValue(
                        cardPendingDelete.studentId
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: "0 0 5px",
                      fontSize: "13px"
                    }}
                  >
                    <strong>
                      Card Number:
                    </strong>
                    {" "}
                    {
                      displayValue(
                        cardPendingDelete.cardNumber
                      )
                    }
                  </p>


                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px"
                    }}
                  >
                    <strong>
                      Version:
                    </strong>
                    {" "}
                    {
                      cardPendingDelete.cardVersion ||
                      1
                    }
                  </p>

                </div>


                <p
                  style={{
                    margin: "16px 0 0",
                    textAlign: "center",
                    color: "#b91c1c",
                    fontSize: "13px",
                    fontWeight: "700"
                  }}
                >
                  ⚠️ This action cannot be undone.
                </p>


                {/* ==================================================
                    DELETE MODAL BUTTONS
                ================================================== */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "22px"
                  }}
                >

                  <button
                    type="button"
                    onClick={
                      cancelDeleteCard
                    }
                    disabled={
                      isDeleting
                    }
                  >
                    ✖ Cancel
                  </button>


                  <button
                    type="button"
                    onClick={
                      confirmDeleteCard
                    }
                    disabled={
                      isDeleting
                    }
                    style={{
                      background: "#dc2626",
                      color: "#ffffff"
                    }}
                  >
                    {
                      isDeleting
                        ?
                        "⏳ Deleting..."
                        :
                        "🗑 Yes, Delete Card"
                    }
                  </button>

                </div>

              </div>

            </div>

          )
        }


        {/* ======================================================
            BOTTOM SPACING
        ====================================================== */}

        <div
          style={{
            height: "50px"
          }}
        />

      </div>

    </Layout>

  );

}

export default ViewIDCards;