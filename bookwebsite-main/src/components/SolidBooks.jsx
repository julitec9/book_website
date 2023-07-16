import { createSignal, createResource, For } from "solid-js";
import "../removeScrollBar.css";

export default function SolidPersonTableServer(props) {
  let baseUrl = "http://localhost:3000/api/";
  let baseUrlImg = "http://localhost:3000/src/pages/images/";

  const [filterString, setFilterString] = createSignal("");
  const [filterStringAuthor, setFilterStringAuthor] = createSignal("");
  const [selectedBookIndex, setSelectedBookIndex] = createSignal("");

  const [reviewAuthor, setReviewAuthor] = createSignal("");
  const [reviewText, setReviewText] = createSignal("");
  const [reviewRating, setReviewRating] = createSignal("");
  const [reviewId, setReviewId] = createSignal("");
  const [showReviewFields, setShowReviewFields] = createSignal(false);
  const [enlargedCardOverflow, setEnlargedCardOverflow] = createSignal("auto");

  const reviewsLength = () => reviews()?.length || 0;

  const calculateAverageRating = () => {
    const reviewArray = reviews();
    if (reviewArray && reviewArray.length > 0) {
      const totalRating = reviewArray.reduce(
        (accumulator, review) => accumulator + review.rating,
        0
      );
      const averageRating = totalRating / reviewArray.length;
      return averageRating.toFixed(1);
    }
    return 0;
  };

  setShowReviewFields(false);

  const fetchBooksRessource = async () => {
    let data = await fetch(baseUrl + "books");
    let json = await data.json();
    return json.booksObject.books;
  };

  const [books, { refetch: booksRefetch }] =
    createResource(fetchBooksRessource);

  const fetchAuthorsRessource = async () => {
    let data = await fetch(baseUrl + "authors");
    let json = await data.json();
    return json.authorsObject.authors;
  };

  const [authors, { refetch: authorsRefetch }] = createResource(
    fetchAuthorsRessource
  );

  const fetchReviewsRessource = async () => {
    if (selectedBookIndex() !== "") {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postType: "select",
          reviewISBN: selectedBookIndex(),
        }),
      };
      let data = await fetch(baseUrl + "reviews", requestOptions);
      let json = await data.json();
      console.log(json);
      return json.reviewsObject.reviews;
    } else {
      return null;
    }
  };

  const postReview = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postType: "insert",
        reviewId: reviewId(),
        reviewAuthor: reviewAuthor(),
        reviewRating: reviewRating(),
        reviewText: reviewText(),
        reviewISBN: selectedBookIndex(),
      }),
    };
    let data = await fetch(baseUrl + "reviews", requestOptions);
    let json = await data.json();
    reviewsRefetch();
  };

  const deleteReview = async (id) => {
    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    };
    let data = await fetch(baseUrl + "reviews", requestOptions);
    let json = await data.json();
    reviewsRefetch();
  };

  const [reviews, { refetch: reviewsRefetch }] = createResource(
    fetchReviewsRessource
  );

  /*function getRatingFromRadio() {
    if (document.getElementById("rating1").checked) {
      return 1;
    } else if (document.getElementById("rating2").checked) {
      return 2;
    } else if (document.getElementById("rating3").checked) {
      return 3;
    } else if (document.getElementById("rating4").checked) {
      return 4;
    } else if (document.getElementById("rating5").checked) {
      return 5;
    }
  }*/

  const cloneAndEnlargeBookCard = (id) => {
    setSelectedBookIndex(id);
  };

  const clearSelectedBook = () => {
    setSelectedBookIndex("");
  };

  const toggleEnlargedMode = () => {
    clearSelectedBook();
  };

  return (
    <div>
      <div
        class="field"
        style={{ padding: "1rem 0 0 1rem", display: "inline-block;" }}
      >
        <input
          id="filter"
          type="text"
          onInput={(e) => setFilterString(e.target.value)}
          placeholder="Filter Buchtitel"
          class="input input-bordered input-info rounded-lg w-[250px] max-w-xs"
        />
      </div>
      <div
        class="field"
        style={{ padding: "1rem 0 0 1rem", display: "inline-block;" }}
      >
        <input
          id="filter"
          type="text"
          onInput={(e) => setFilterStringAuthor(e.target.value)}
          placeholder="Filter Autor"
          class="input input-bordered input-info rounded-lg w-[250px] max-w-xs"
        />
      </div>
      <div
        class="book-container flex-wrap -mb-4"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        {books() &&
          authors() &&
          books()
            .filter(
              (book) =>
                book.title
                  .toLowerCase()
                  .indexOf(filterString().toLowerCase()) >= 0
            )
            .filter(
              (book) =>
                authors()
                  .filter(
                    (author) =>
                      author.name
                        .toLowerCase()
                        .indexOf(filterStringAuthor().toLowerCase()) >= 0
                  )
                  .filter((author) => author.id === book.author).length > 0
            )
            .map((book) => (
              <div
                class={`book-card rounded-lg ${
                  selectedBookIndex() === book.ISBN ? "selected" : ""
                }`}
                style={{
                  position: "relative",
                  top: "1rem",
                  left: "1rem",
                  width: "250px",
                  height: "350px",
                  overflow: "hidden",
                }}
                id={`card-${book.ISBN}`}
                onClick={() => {
                  cloneAndEnlargeBookCard(book.ISBN);
                  reviewsRefetch();
                }}
              >
                <img
                  class="book-image"
                  src={baseUrlImg + book.image}
                  alt={book.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
                <div
                  class="content text-xs"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.7)",
                    color: "#fff",
                    padding: "1rem",
                    boxSizing: "border-box",
                    opacity: 0, // Hide the content by default
                    transition: "opacity 0.3s ease", // Add transition effect
                  }}
                  id={`content-${book.ISBN}`} // Unique identifier for each content
                >
                  <div class="title font-extrabold">{book.title}</div>
                  <div class="publish-year italic">{book.publish_year}</div>
                </div>
                <div
                  class="book-card-overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0, // Hide the overlay by default
                    transition: "opacity 0.3s ease", // Add transition effect
                  }}
                  id={`overlay-${book.ISBN}`} // Unique identifier for each overlay
                  onMouseEnter={() => {
                    // Show the content and overlay on hover
                    document.getElementById(
                      `content-${book.ISBN}`
                    ).style.opacity = 1;
                    document.getElementById(
                      `overlay-${book.ISBN}`
                    ).style.opacity = 1;
                  }}
                  onMouseLeave={() => {
                    // Hide the content and overlay when not hovering
                    document.getElementById(
                      `content-${book.ISBN}`
                    ).style.opacity = 0;
                    document.getElementById(
                      `overlay-${book.ISBN}`
                    ).style.opacity = 0;
                  }}
                ></div>
              </div>
            ))}
        {selectedBookIndex() !== "" && (
          <div>
            <div
              class="dark-overlay "
              style={{
                position: "fixed",
                left: "0px",
                top: "0px",
                zIndex: -1,
                width: "100vw",
                height: "100vh",
                background: "#090d2b",
                opacity: "90%",
              }}
              onClick={clearSelectedBook}
            ></div>

            {/* Enlarged Book Card */}
            <div
              class="enlarged-book-card-container rounded-lg"
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "600px",
                height: "850px",
                zIndex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#0F1545",
                overflow: enlargedCardOverflow(),
                pointerEvents: "auto",
              }}
            >
              <div
                class="book-card rounded-lg overflow-y-scroll overscroll-y-none scrollbar-hidden"
                style={{
                  width: "600px",
                  height: "850px",
                }}
                key={selectedBookIndex()}
              >
                {/* Book Image in Enlarged Book Card*/}
                <div
                  class="image-with-overlay"
                  style={{
                    position: "relative",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "50%",
                    pointerEvents: "auto",
                    overflow: "hidden",
                  }}
                >
                  <img
                    class="book-image object-cover blur"
                    src={
                      baseUrlImg +
                      books().find((book) => book.ISBN === selectedBookIndex())
                        .image
                    }
                    alt={
                      books().find((book) => book.ISBN === selectedBookIndex())
                        .title
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                    }}
                  />
                  {/* Enlarged book-card image gradient */}
                  <div
                    class="gradient-overlay"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      width: "100%",
                      height: "50%",
                      background:
                        "linear-gradient(to top, rgba(15,21,69,1) 0%,rgba(9,13,43,0) 100%)",
                    }}
                  />
                </div>
                {/* Content */}
                <div
                  class="content text-xs fixed"
                  style={{
                    top: 0,
                    left: 0,
                    color: "#fff",
                    opacity: 1,
                  }}
                  id={`content-${selectedBookIndex()}`}
                >
                  {/* Book title */}
                  <div
                    class="title font-extrabold text-5xl"
                    style={{ padding: "1rem 1rem 0 1rem" }}
                  >
                    {
                      books().find((book) => book.ISBN === selectedBookIndex())
                        .title
                    }
                  </div>

                  {/* Publish year */}
                  <div
                    class="publish-year text-base"
                    style={{ padding: "0 1rem 0 1rem" }}
                  >
                    {
                      books().find((book) => book.ISBN === selectedBookIndex())
                        .publish_year
                    }
                  </div>

                  {/* Author (image+name) */}
                  {
                    <div
                      class="author-div text-center"
                      style={{
                        width: "150px",
                        padding: "3rem 0 0 0",
                        margin: "0 auto",
                      }}
                    >
                      <img
                        class="author-picture rounded-full object-cover transform hover:scale-110 transition-transform duration-300"
                        src={
                          baseUrlImg +
                          authors().find(
                            (author) =>
                              author.id ===
                              books().find(
                                (book) => book.ISBN === selectedBookIndex()
                              ).author
                          )?.image
                        }
                        style={{
                          width: "150px",
                          height: "150px",
                          boxSizing: "border-box",
                        }}
                      />
                      <div
                        class="author text-base"
                        style={{
                          padding: "1rem 0 0 0",
                        }}
                      >
                        {
                          authors().find(
                            (author) =>
                              author.id ===
                              books().find(
                                (book) => book.ISBN === selectedBookIndex()
                              ).author
                          )?.name
                        }
                      </div>
                      <div
                        class="review-average"
                        style={{ padding: "1rem 0 0 0" }}
                      >
                        (Rating: {calculateAverageRating}/5)
                      </div>
                      {
                        <div
                          class="stars"
                          style={{ padding: "0.5rem 0 0.5rem 0" }}
                        >
                          <i class="fa fa-star fa-2x text-amber-400"></i>
                          <i class="fa fa-star fa-2x text-amber-400"></i>
                          <i class="fa fa-star fa-2x text-amber-400"></i>
                          <i class="fa fa-star fa-2x text-amber-400"></i>
                          <i class="fa fa-star fa-2x "></i>
                        </div>
                      }
                      <div class="review-amount">
                        (Total of {reviewsLength} reviews)
                      </div>
                    </div>
                  }

                  {/* Write a review button */}
                  <button
                    class="review button text-center rounded-lg text-base font-light
                    flex items-center justify-center w-64 h-12 relative border border-blue-500
                    text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                    style={{ margin: "10rem 0rem 0rem 1rem" }}
                    onClick={() => {
                      setShowReviewFields(!showReviewFields());
                      setEnlargedCardOverflow(
                        showReviewFields() ? "hidden" : "auto"
                      ); // Toggle the overflow property
                    }}
                  >
                    Write a review
                  </button>

                  {showReviewFields() && (
                    <div
                      class="review-container flex flex-col rounded-lg text-base"
                      style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: "9999",
                        width: "400px",
                        height: "500px",
                        background: "#121212",
                        padding: "2rem",
                        overflow: "hidden", // Disable scrolling
                      }}
                    >
                      <div
                        class="delete-button text-right hover:text-red-500"
                        onClick={() => {
                          setShowReviewFields(!showReviewFields());
                          setEnlargedCardOverflow(
                            showReviewFields() ? "hidden" : "auto"
                          ); // Toggle the overflow property
                        }}
                        style={{
                          position: "absolute",
                          top: "1rem",
                          right: "1rem",
                        }} // Use position: "absolute" and adjust top and right positions
                      >
                        <i class="fas fa-times-circle"></i>
                      </div>
                      <div class="title text-center text-2xl font-extrabold tracking-wider">
                        Bookreviewz
                      </div>
                      <div class="subtitle text-center text-xl font-light">
                        Write a review!
                      </div>

                      <label
                        for="InputReviewAuthor"
                        class="font-extrabold pt-4"
                      >
                        UUID:
                      </label>
                      <input
                        type="text"
                        id="InputReviewId"
                        class="top-2 relative rounded-md"
                      />

                      <label
                        for="InputReviewAuthor"
                        class="font-extrabold pt-4"
                      >
                        Name:
                      </label>
                      <input
                        type="text"
                        id="InputReviewAuthor"
                        class="top-2 relative rounded-md"
                      />

                      {/*<input type="radio" name="rating" id="rating1" />
                      <label for="rating1">★</label>
                      <input type="radio" name="rating" id="rating2" />
                      <label for="rating2">★★</label>
                      <input type="radio" name="rating" id="rating3" />
                      <label for="rating3">★★★</label>
                      <input type="radio" name="rating" id="rating4" />
                      <label for="rating4">★★★★</label>
                      <input type="radio" name="rating" id="rating5" checked />
                      <label for="rating5">★★★★★</label>*/}

                      <label for="rating" class="font-extrabold pt-4">
                        Rating:
                      </label>
                      <input
                        type="text"
                        name="rating"
                        id="InputReviewRating"
                        placeholder="Just type 0 to 5"
                        class="top-2 relative rounded-md"
                      />
                      <label for="InputReviewText" class="font-extrabold pt-4">
                        Text:
                      </label>
                      <input
                        type="text"
                        id="InputReviewText"
                        class="top-2 relative rounded-md h-20"
                        style={{ textAlign: "left" }}
                      />

                      <button
                        onClick={() => {
                          setReviewId(
                            document.getElementById("InputReviewId").value
                          );
                          setReviewAuthor(
                            document.getElementById("InputReviewAuthor").value
                          );
                          setReviewRating(
                            document.getElementById("InputReviewRating").value
                          );
                          setReviewText(
                            document.getElementById("InputReviewText").value
                          );
                          postReview();
                        }}
                        class="button text-center rounded-lg text-base font-light
                        flex items-center justify-center h-12 border border-blue-500
                        text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                        style={{
                          bottom: "1rem",
                          position: "absolute",
                          width: "256px",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        Review veröffentlichen!
                      </button>
                    </div>
                  )}

                  {/* Description of book */}
                  <div
                    class="description-container"
                    style={{ padding: "1rem 1rem 0 1rem" }}
                  >
                    <div class="caption text-base font-medium text-xl">
                      Summary
                    </div>
                    <div
                      class="description text-base font-light text-justify text-last-left"
                      style={{
                        color: "#fff",
                        opacity: 1,
                        pointerEvents: "auto",
                      }}
                    >
                      {
                        books().find(
                          (book) => book.ISBN === selectedBookIndex()
                        ).description
                      }
                    </div>
                  </div>

                  {/* Display of Reviews */}
                  {
                    <div>
                      {reviews() &&
                        reviews().map((review) => (
                          <div
                            class="review-container text-sm font-light rounded-lg hover:shadow-xl shadow-slate-500 transition duration-300"
                            style={{
                              padding: "1rem",
                              margin: "1rem",
                              background: "#171c3e",
                            }}
                          >
                            <button
                              className="delete-button text-right hover:text-red-500"
                              style={{
                                position: "absolute",
                                right: "2rem",
                              }}
                              onClick={() => deleteReview(review.id)}
                            >
                              <i class="fas fa-trash-alt"></i>
                            </button>

                            <button
                              className="delete-button text-right hover:text-blue-500"
                              style={{
                                position: "absolute",
                                right: "3rem",
                              }}
                              //onClick={() => deleteReview(review.id)}
                            >
                              <i class="fas fa-pencil-alt"></i>
                            </button>

                            <div class="Username" style={{ padding: "" }}>
                              {review.username}
                            </div>
                            <div class="Rating" style={{ color: "gold" }}>
                              {review.rating}
                            </div>
                            <div class="Text">{review.text}</div>
                          </div>
                        ))}
                    </div>
                  }
                </div>

                {/* Close Button */}
                <div
                  class="close-button rounded-full"
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    color: "#171c3e",
                    padding: "0.2rem",
                    background: "white",
                    zIndex: 3,
                  }}
                >
                  <button onClick={toggleEnlargedMode}>
                    <i class="fas fa-times-circle fa-2x hover:text-gray-700"></i>
                  </button>
                </div>

                {/* Review field */}
                {/*
                  <div
                    class="review-fields"
                    style={{
                      zIndex: 5,
                      pointerEvents: "auto",
                    }}
                  >
                    <br />
                    <br />
                    <br />
                    <label for="InputReviewAuthor">Name: </label>
                    <input type="text" id="InputReviewAuthor"></input>
                    <br />
                    <label for="InputReviewText">Text: </label>
                    <input type="text" id="InputReviewText"></input>
                    <br />

                    <input type="radio" name="rating" id="rating1"></input>
                    <label for="radio1">★</label>
                    <br />
                    <input type="radio" name="rating" id="rating2"></input>
                    <label for="radio2">★★</label>
                    <br />
                    <input type="radio" name="rating" id="rating3"></input>
                    <label for="radio3">★★★</label>
                    <br />
                    <input type="radio" name="rating" id="rating4"></input>
                    <label for="radio4">★★★★</label>
                    <br />
                    <input
                      type="radio"
                      name="rating"
                      id="rating5"
                      checked="true"
                    ></input>
                    <label for="radio5">★★★★★</label>
                    <br />

                    <button
                      onClick={() => {
                        setReviewAuthor(
                          document.getElementById("InputReviewAuthor").value
                        );
                        setReviewRating(getRatingFromRadio());
                        setReviewText(
                          document.getElementById("InputReviewText").value
                        );
                        postReview();
                      }}
                      class="my-10 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                    >
                      Review veröffentlichen!
                    </button>
                  </div>
                */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
