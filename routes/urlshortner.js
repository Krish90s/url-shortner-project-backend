const express = require("express");
const router = express.Router();
const { UrlModel } = require("../models/urlsshort");
const auth = require("../middleware/auth");
require("dotenv").config();

router.get("/", auth, async (req, res) => {
  const shorturls = await UrlModel.find().sort("shortUrl");
  res.send(shorturls);
});

router.get("/u", async (req, res) => {
  let shorturls = await UrlModel.findOne({ urlCode: req.query.t });
  if (!shorturls) return res.status(400).send("invalid url");

  UrlModel.findByIdAndUpdate(
    { _id: shorturls._id },
    { $inc: { clickCount: 1 } },
    function (err, updatedData) {
      if (err) throw err;
      res.redirect(shorturls.longUrl);
    }
  );
});

router.post("/", auth, async (req, res) => {
  const urlcode = generateUrl();
  const baseurl = process.env.BASEURL;
  let urlShort = new UrlModel({
    longUrl: req.body.longUrl,
    urlCode: urlcode,
    shortUrl: baseurl + "u?t=" + urlcode,
  });
  urlShort = await urlShort.save();
  res.send(urlShort);
});

function generateUrl() {
  var rndResult = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;

  for (var i = 0; i < 5; i++) {
    rndResult += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  return rndResult;
}

module.exports = router;
