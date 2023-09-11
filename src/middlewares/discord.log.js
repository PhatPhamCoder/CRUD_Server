const PushToMessage = require("../loggers/discord.log.v2");

exports.pushToLogDiscord = async (req, res, next) => {
  try {
    console.log(req.get("host"));
    await PushToMessage(req.get("host"));

    return next();
  } catch (error) {
    next(error);
  }
};
