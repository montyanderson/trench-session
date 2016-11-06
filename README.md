# trench-session

:date: Session middleware for [Trench](https://github.com/montyanderson/trench), using Redis.

## Usage

``` javascript
const Trench = require("trench");
const session = require("trench-session");

const app = new Trench();

app.use(session({
	app: "app"
}));

app.get("/", (req, res) => {
	if(!req.session.i) req.session.i = 0;
	req.session.i++;

	res.end(req.session.i.toString());
});

app.listen(8080);
```

## API

### session([options])

Returns a middleware function to generate functions, then save them when `res.end()` is called.

#### options

##### app

Type: `string`

A name for the application, used so you can store multiple app's sessions in the same redis database, without possibility of interference.

##### expire

Type: `number`

Amount of seconds until the session expires, since last saved.

##### db

Type: `string`, `object`

Connection configuration, to be passed to `redis.createClient()`.

##### client

Type: `object`

A redis client, i.e. created by `redis.createClient()`.
