const crypto = require("crypto");
const redis = require("p-redis");
const cookie = require("cookie");
const uid = require("uid-safe");

function session(options = {}) {
	const defaults = {
		expire: 60 * 60 * 24 // one day
	};

	options = Object.assign({}, defaults, options);

	const db = options.client || redis.createClient(options.db);

	return (req, res) => {
		let key;

		return Promise.resolve().then(() => {
			if(!req.headers.cookie) {
				req.cookies = {};
			} else {
				req.cookies = cookie.parse(req.headers.cookie) || {};
			}

			if(!req.cookies.session) {
				return uid(24).then(id => {
					res.setHeader("Set-Cookie", cookie.serialize("session", id));
					req.cookies.session = id;
				});
			}
		}).then(() => {
			const hash = crypto.createHash("sha256");
			hash.update(req.cookies.session);

			key = "session:" + (options.app || "app") + ":" + hash.digest("base64");

			return db.existsAsync(key).then(exists => {
				if(exists) {
					return db.getAsync(key).then(json => {
						req.session = JSON.parse(json);

					});
				} else {
					req.session = {};
				}
			});
		}).then(() => {
			const _end = res.end;

			res.end = function() {
				db.multi()
					.set(key, JSON.stringify(req.session))
					.expire(key, options.expire)
					.execAsync();

				_end.apply(this, arguments);
			}
		});
	}
};

module.exports = session;
