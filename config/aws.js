// const pool = require("./db");
// const xml2js = require("xml2js");

// async function getAwsConfig(channelName) {
//   const [rows] = await pool.query(
//     `SELECT * FROM deliverychannels where CHANNELNAME = "${channelName}"`
//   );
//   // Find the S3 channel
//   const s3Channel = rows.find((channel) => channel.CHANNELTYPE === "s3");

//   if (!s3Channel) {
//     throw new Error("S3 channel not found");
//   }

//   const configXML = s3Channel.CONFIGXML;
//   let config;

//   xml2js.parseString(configXML, (err, result) => {
//     if (err) {
//       console.error(err);
//       throw new Error("Failed to parse config XML");
//     } else {
//       config = {
//         bucketName: result.config.Param.find(
//           (param) => param.$.Name === "bucket-name"
//         ).$.Value,
//         destinationFolder: result.config.Param.find(
//           (param) => param.$.Name === "destination-folder"
//         ).$.Value,
//         awsRegion: result.config.Param.find(
//           (param) => param.$.Name === "region"
//         ).$.Value,
//         accessKeyId: result.config.Param.find(
//           (param) => param.$.Name === "access-key"
//         ).$.Value,
//         secretAccessKey: result.config.Param.find(
//           (param) => param.$.Name === "secret-key"
//         ).$.Value,
//       };
//     }
//   });

//   return config;
// }

// module.exports = { getAwsConfig };
const pool = require("./db");
const xml2js = require("xml2js");

async function createMultiWatch() {
  const [rows] = await pool.query(
    `SELECT * FROM deliverychannels WHERE CHANNELTYPE = 's3';`
  );

  const watches = [];

  for (const row of rows) {
    const config = await getAwsConfig(row.CONFIGXML);
    const channel = await getChannelDetails(row.CHANNELNAME);
    console.log("channel", channel);
    const watch = {
      type: "s3",
      bucketName: config.bucketName,
      folderName: config.destinationFolder,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.awsRegion,
      fileType: channel.fileType,
      groupId: channel.groupId,
      companyId: channel.companyId,
      path: channel.path,
    };
    watches.push(watch);
  }

  return watches;
}

async function getAwsConfig(configXML) {
  let config;

  xml2js.parseString(configXML, (err, result) => {
    if (err) {
      console.error(err);
      throw new Error("Failed to parse config XML");
    } else {
      config = {
        bucketName: result.config.Param.find(
          (param) => param.$.Name === "bucket-name"
        ).$.Value,
        destinationFolder: result.config.Param.find(
          (param) => param.$.Name === "destination-folder"
        ).$.Value,
        awsRegion: result.config.Param.find(
          (param) => param.$.Name === "region"
        ).$.Value,
        accessKeyId: result.config.Param.find(
          (param) => param.$.Name === "access-key"
        ).$.Value,
        secretAccessKey: result.config.Param.find(
          (param) => param.$.Name === "secret-key"
        ).$.Value,
      };
    }
  });

  return config;
}

async function getChannelDetails(channelName) {
  const [rows] = await pool.query(
    `SELECT * FROM prodenvironment where CHANNEL_NAME='${channelName}'`
  );
  let details;
  if (rows[0].CHNNEL_NAME !== 0) {
    details = {
      fileType: rows[0].FILEEXTENSION,
      groupId: rows[0].GROUPID,
      companyId: rows[0].COMPANYID,
      path: rows[0].WATCHPARAMS,
    };
    return details;
  }
}
module.exports = { createMultiWatch };
