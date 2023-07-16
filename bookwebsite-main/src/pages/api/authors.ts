import type { APIRoute } from "astro";
import sqlite from "better-sqlite3";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const dbPath = path.resolve("./src/db/", "books.db");

export async function get({ params, request }) {
  let db = new sqlite(dbPath);
  let authorsFromDb = await db.prepare("SELECT * FROM Authors").all();
  db.close();
  return {
    body: JSON.stringify({
      authorsObject: {
        authors: authorsFromDb,
        success: "ok",
        errorMessage: "",
      },
    }),
  };
}

export async function post({ params, request }) {
  // überprüfen, ob alle Daten vorhanden sind.
  // Die Daten werden in dem Body übertragen.
  // Diese Daten im Body lassen sich durch umwandeln
  // des JSON Strings in ein Objekt verarbeiten.
  let car = await request.json();
  if (car.hasOwnProperty("name") && car.hasOwnProperty("license")) {
    let id = uuidv4();
    let name = car.name;
    let license = car.license;
    let timestamp = dayjs().unix();
    let db = new sqlite(dbPath);
    let added = db
      .prepare(
        "INSERT INTO Cars (id, name, license, timestamp) VALUES (?,?,?,?)"
      )
      .run(id, name, license, timestamp);
    db.close();
    return {
      body: JSON.stringify({
        success: "ok",
        message: "new person added",
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
