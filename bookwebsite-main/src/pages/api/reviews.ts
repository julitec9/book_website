import type { APIRoute } from "astro";
import sqlite from "better-sqlite3";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const dbPath = path.resolve("./src/db/", "books.db");

/*
export async function get({ params, request }) {
  let review = await request.json();
  if (review.hasOwnProperty("reviewISBN")){
    console.log("HIA")
    let db = new sqlite(dbPath);
    let reviewsFromDB = await db.prepare("SELECT * FROM Reviews where ISBN = (?)").run(review.reviewISBN);
    db.close();
    return {
      body: JSON.stringify({
        reviewsObject: {
          reviews: reviewsFromDB,
          success: "ok",
          errorMessage: "",
        },
      }),
    };
  }
  else{
    console.log("FISH")
    return {
      body: JSON.stringify({
        success: "error",
        message: "attributes missing"
      })
    }
  }
}
*/


export async function post({ params, request }) {
  let review = await request.json();

  if (review.hasOwnProperty("postType")) {
    if (review.postType === "select") {
      if (review.hasOwnProperty("reviewISBN")) {
        let db = new sqlite(dbPath);
        let reviewsFromDB = await db.prepare("SELECT * FROM Reviews where ISBN = (?)").all(review.reviewISBN);
        db.close();
        return {
          body: JSON.stringify({
            reviewsObject: {
              reviews: reviewsFromDB,
              success: "ok",
              errorMessage: "",
            },
          }),
        };
      }
      else {
        return {
          body: JSON.stringify({
            success: "error",
            message: "attributes missing"
          })
        }
      }
    }
    else if (review.postType === "insert") {
      if (review.hasOwnProperty("reviewAuthor")
        && review.hasOwnProperty("reviewText")
        && review.hasOwnProperty("reviewRating")
        && review.hasOwnProperty("reviewISBN")) {
        let id = uuidv4();
        let db = new sqlite(dbPath);
        let added = db.prepare("INSERT INTO Reviews (username, rating, text, ISBN) VALUES (?,?,?,?)")
          .run(review.reviewAuthor, review.reviewRating, review.reviewText, review.reviewISBN);
        db.close();
        return {
          body: JSON.stringify({
            success: "ok",
            message: "new review added"
          })
        };
      } else {
        return {
          body: JSON.stringify({
            success: "error",
            message: "attributes missing"
          })
        }
      }
    }
  }
  else {
    return {
      body: JSON.stringify({
        success: "error",
        message: "attributes missing"
      })
    }
  }
}

/*
export async function put({ params, request }) {
  // überprüfen, ob alle Daten vorhanden sind.
  // Die Daten werden in dem Body übertragen.
  // Diese Daten im Body lassen sich durch umwandeln
  // des JSON Strings
  let car = await request.json();
  if (
    car.hasOwnProperty("id") &&
    car.hasOwnProperty("name") &&
    car.hasOwnProperty("license")
  ) {
    let timestamp = dayjs().unix();
    let db = new sqlite(dbPath);
    const updates = db
      .prepare(
        "UPDATE Cars SET name = ?, license = ?, timestamp = ? WHERE id = ?"
      )
      .run(car.name, car.license, timestamp, car.id);
    db.close();
    return {
      body: JSON.stringify({
        success: "ok",
        message: updates.changes + " person updated",
      }),
    };
  } else {
    return {
      body: JSON.stringify({
        success: "error",
        message: "attributes missing",
      }),
    };
  }
}

export async function del({ params, request }) {
  // überprüfen, ob alle Daten vorhanden sind.
  // Die Daten werden in dem Body übertragen.
  // Diese Daten im Body lassen sich durch umwandeln
  // des JSON Strings
  let body = await request.json();
  if (body.hasOwnProperty("id")) {
    let db = new sqlite(dbPath);
    const updates = db.prepare("DELETE FROM Cars WHERE id = ?").run(body.id);
    db.close();
    return {
      body: JSON.stringify({
        success: "ok",
        message: updates.changes + " person deleted",
      }),
    };
  } else {
    return {
      body: JSON.stringify({
        success: "error",
        message: "attributes missing",
      }),
    };
  }
  
}
*/