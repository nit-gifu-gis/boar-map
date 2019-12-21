export default (req, res) => {
  const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  const service = req["query"]["service"];
  const endpoint = req["query"]["endpoint"];

  let getparam = "";
  for (let i = 0; i < Object.keys(req["query"]).length; i++) {
    const key = Object.keys(req["query"])[i];
    if (key.toLowerCase() != "service" && key.toLowerCase() != "endpoint") {
      if (getparam == "") {
        getparam = `?${key}=${req["query"][key]}`;
      } else {
        getparam += `&${key}=${req["query"][key]}`;
      }
    }
  }

  const headers = {};

  if (req.headers["x-map-api-access-token"] != undefined) {
    headers["X-Map-Api-Access-Token"] = req.headers["x-map-api-access-token"];
  }

  for (let i = 0; i < Object.keys(req.headers).length; i++) {
    const key = Object.keys(req.headers)[i];
    if (key.toLowerCase() != "host") {
      headers[key] = req.headers[key];
    }
  }

  let body = "";
  if (req["body"] != undefined && req["body"] != null && req["body"] != "") {
    if (typeof req["body"] == "string") {
      body = req["body"];
    } else {
      body = JSON.stringify(req["body"]);
    }
  }

  const url = `https://pascali.info-mapping.com/webservices/publicservice/${service}/${endpoint}${getparam}`;
  const req2 = new XMLHttpRequest();
  req2.open(req["method"], url, true);
  req2.onreadystatechange = function(e) {
    if (req2.readyState != 4) {
      return;
    }
    if (req2.status !== 200) {
      res.status(req2.status).end(req2.responseText);
      return;
    }
    res.status(200).end(req2.responseText);
  };
  req2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  if (req.headers["content-type"] != undefined) {
    req2.setRequestHeader("Content-Type", req.headers["content-type"]);
  }
  if (req.headers["x-map-api-access-token"] != undefined) {
    req2.setRequestHeader(
      "X-Map-Api-Access-Token",
      req.headers["x-map-api-access-token"]
    );
  }

  req2.send(body);
};
