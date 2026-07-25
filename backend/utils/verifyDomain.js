const dns = require("dns").promises;

const domainCanReceiveEmail = async (email) => {
  try {
    const domain = email.split("@")[1];
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
};

module.exports = { domainCanReceiveEmail };