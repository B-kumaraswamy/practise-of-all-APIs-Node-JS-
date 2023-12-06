const express = require("express");
const path = require("path");

const { open } = require("sqlite");
// open() method is used to connect the database server and
// provides a connection object to operate on the database.

const sqlite3 = require("sqlite3");

const app = express();

const dbPath = path.join(__dirname, "goodreads.db");

app.use(express.json()); // it is used bcz the sent request body is
// of json format. By using this we would be able to parse incoming request body

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database, // notice "D" in Database
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  // request.params give all the path parameters of a request
  // and among all we need only bookId
  const getBookQuery = `
    SELECT 
    *
    FROM
    book
    WHERE
    book_id = ${bookId}`;
  const book = await db.get(getBookQuery);
  response.send(book);
});

// Add Book API
app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  // accessing the body of the request and destructuring it below accordingly

  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  // dbResponse.lastID provides the primary key of the new row inserted.

  response.send({ bookId: bookId });
});

// Update Book API
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;

  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;

  await db.run(updateBookQuery);
  response.send("Book updated Successfully");
});

// Delete Book API
app.delete("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `
    DELETE FROM 
    book
    WHERE 
    book_id = ${bookId}`;

  await db.run(deleteBookQuery);
  response.send("Deleted book successfully");
});

// Get Author Books API (books related to a particular author)
app.get("/authors/:authorId/books", async (request, response) => {
  const { authorId } = request.params;
  const getAuthorBookQuery = `
   SELECT 
   *
   FROM 
   book
   WHERE 
   author_id = ${authorId}`;
  const booksArray = await db.all(getAuthorBookQuery);
  response.send(booksArray);
});

// request method used : sql method
// Get + all() ----all the info
// Get + get() ----specific info/row of a a table
// post + run() ---- add
// put + run()  ---- update
// delete + run()
