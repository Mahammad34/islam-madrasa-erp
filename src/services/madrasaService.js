import {
    addDoc,
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore";

import {
    db
} from "../firebase";


export const getMadrasaId = () => {

  const madrasaId =
    localStorage.getItem(
      "madrasaId"
    );

  if (!madrasaId) {

    throw new Error(
      "Madrasa ID not found. Please login again."
    );

  }

  return madrasaId;

};


export const getMadrasaCollection = (
  collectionName
) => {

  const madrasaId =
    getMadrasaId();

  return query(

    collection(
      db,
      collectionName
    ),

    where(
      "madrasaId",
      "==",
      madrasaId
    )

  );

};


export const getMadrasaDocuments =
  async (
    collectionName
  ) => {

    const snapshot =
      await getDocs(

        getMadrasaCollection(
          collectionName
        )

      );

    return snapshot.docs.map(
      (document) => ({

        id:
          document.id,

        ...document.data()

      })
    );

  };


export const addMadrasaId = (
  data
) => {

  const madrasaId =
    getMadrasaId();

  return {

    ...data,

    madrasaId

  };

};


export const addMadrasaDocument =
  async (
    collectionName,
    data
  ) => {

    const documentData =
      addMadrasaId(
        data
      );

    return await addDoc(

      collection(
        db,
        collectionName
      ),

      documentData

    );

  };