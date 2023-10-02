let router = require("express").Router();
let auth = require("../auth");
const Book = require("../../models/Book");

let { OkResponse, BadRequestResponse, UnauthorizedResponse } = require("express-http-response");

router.get("/", function (req, res, next) {
  return next(
    new OkResponse({
      message: `Books Api's are working`,
    })
  );
});

router.get("/getBook", async (req, res, next) => {
  try {
    const { author, title, ISBN, review } = req.query;
    const query = {};

    if (author) {
      query.Author = new RegExp(author, "i");
    }
    if (title) {
      query.Title = new RegExp(title, "i");
    }
    if (ISBN) {
      query.ISBN = new RegExp(ISBN, "i");
    }
    if (review) {
      query.Review = new RegExp(review, "i");
    }

    const books = await Book.find(query);
    return res.json(new OkResponse(books));

    // const { query } = req.params;

    // console.log("Query", query);

    // const regex = new RegExp(query, "i");

    // const books = await Book.find({
    //   $or: [{ ISBN: regex }, { title: regex }, { author: regex }, { review: regex }],
    // });
    // return next(new OkResponse(books));
  } catch (err) {
    return next(new BadRequestResponse(err));
  }
});

router.post("/create/:bookId", auth.required, async (req, res, next) => {
  try {
    if (!req.body.review) {
      return next(new BadRequestResponse("Missing Required parameters"));
    }

    const book = await Book.findOne({ _id: req.params.bookId });

    if (!book) {
      return next(new BadRequestResponse("Book not found"));
    }

    book.review = req.body.review;

    await book.save();

    return next(new OkResponse(book));
  } catch (err) {
    return next(new BadRequestResponse(err.message)); // Use err.message to get the error message
  }
});

router.get("/getOne/:bookId", (req, res, next) => {
  Book.findById(req.params.bookId)
    .then(async (book) => {
      await book.populate("Author", "name country");
      return next(new OkResponse(book));
    })
    .catch((err) => {
      return next(new BadRequestResponse(err));
    });
});

router.get("/getBooks", (req, res, next) => {
  Book.find()
    .populate("Author", "name country")
    .then((book) => {
      return next(new OkResponse(book));
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/create", async (req, res, next) => {
  if (!req.body.name) {
    return next(new BadRequestResponse("Missing Required parameters"));
  }

  let newBook = Book();
  newBook.name = req.body.name;
  newBook.title = req.body.title;
  newBook.price = req.body.price;
  newBook.author = req.body.author;
  newBook.ISBN = req.body.ISBN;
  newBook.review = req.body.review;

  newBook
    .save()
    .then(async (book) => {
      return next(new OkResponse(book));
    })
    .catch((err) => {
      return next(new BadRequestResponse(err));
    });
});

router.delete("/delete/:bookId", auth.required, async (req, res, next) => {
  console.log("delete book hit ");
  try {
    const book = await Book.findOne({ _id: req.params.bookId });

    if (!book) {
      return next(new BadRequestResponse("Book does not exist.", 422.0));
    }
    book.review = "";

    book.save((err, book) => {
      if (err) return next(new BadRequestResponse(err));
      return next(new OkResponse(book));
    });
  } catch (error) {
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});

router.put("/update/:bookId", auth.required, async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findOne({ _id: bookId });

    if (!book) {
      return next(new BadRequestResponse("Book does not exist.", 422.0));
    }
    book.review = req.body.review;

    book.save((err, book) => {
      if (err) return next(new BadRequestResponse(err));
      return next(new OkResponse({ book, message: "Otp sent Successfuuly" }));
    });
  } catch (error) {
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});

router.get("/search", async (req, res, next) => {
  const searchQuery = req.query.q;

  console.log("search query: " + searchQuery);
  if (!searchQuery) {
    return next(new BadRequestResponse("Missing search query parameter"));
  }
  try {
    const books = await Book.find({
      $or: [
        { author: { $regex: searchQuery, $options: "i" } },
        { title: { $regex: searchQuery, $options: "i" } },
        { ISBN: { $regex: searchQuery, $options: "i" } },
        { review: { $regex: searchQuery, $options: "i" } },
      ],
    });
    return next(new OkResponse(books));
  } catch (err) {
    return next(new BadRequestResponse(err));
  }
});

module.exports = router;
