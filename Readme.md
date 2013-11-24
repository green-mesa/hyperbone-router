# Hyperbone Router

[![Build Status](https://travis-ci.org/green-mesa/hyperbone-router.png?branch=master)](https://travis-ci.org/green-mesa/hyperbone-router)

Routers are pretty commonplace in the Javascript eco-system so this particular router is probably a bit odd, all things considered.

Luckily, being modular, you don't need to install this if you have something else you'd rather use - especially if you want to use HTML5 History API instead of Hashbangs.

## Features

- Hashbang based because the particular usecase we have for this module requires this
- Express/Sinatra style routes
- Hyperbone event based
- Activate and Deactivate events to subscribe to.

## Example

Some initial setup. We have a top level application model that contains a list of products, products and a resources model. We then create a view..

```js
var Router = require('hyperbone-router').Router;

// our appModel contains two models
var appModel = new HyperboneModel({
	productList : [
		{
			_links : {
				self : {
					href : "/products/product-1"
				}
			},
			title : "Some product"
		},
		{
			_links : {
				self : {
					href : "/products/product-1"
				}
			},
			title : "Some other product"
		}
	]
	product : {
		active : false
	},
	resource : {
		active : false
	}
});

var view = new HyperboneView({
	el : '#application-root',
	model : appModel
});
```

... which points to this ridiculously unrealistic example of HTML. In this example, when products.active is true, the products section is shown. If resources.active is true, the resources section is shown. The product list is turned into a list of hashbang links.

```html
<section id="applications-root">
	<section>
		<ul hb-with="product-list">
			<li><a href="#!{{url()}}">Product: {{title}}</a></li>
		</ul>
	</section>
	<section hb-with="products" if="active">
		<h3>I'm the products route!</h3>
		<ul hb-with="resource-list">
			<li><a href="#!{{url()}}">Resources in our product: {{title}}</a></li>
		</ul>
	</section>
	<section hb-with="resources" if="active">
		<h3>{{title}}</h3>
		<p>{{description}}</p>
	</section>
</section>
```

When a route becomes active, we update the uri for the nested model and do a fetch. We also copy the id and set the active flag to true. 

When a route is deactivated, we set the active flag to false. This hides the section of the view for that route. 

```js
var app = new Router();

app
	.route('/products/:id')
		.on('activate', function(ctx, uri){
			// we're now on this route!

			// ctx is our context. it has any params gathered from the route.
			// see component/page.js for more

			// we want to 'active' our nested products mode.

			var product = appModel.get('product');

			product
				.set({
					id : ctx.id,
					active : true
				})
				.url(uri)
				.fetch();

		})
		.on('deactivate', function(uri){
			// we're not longer on this route, be we were before.
			// we can do some teardown stuff here.

			// we just want to set the nested products model to active = false.

			var products = appModel.get('products');
			products.set('active', false);
		})
	.route('/resources/:id')
		.on('activate', function(ctx, uri){

			var resources = appModel.get('resource');

			resource
				.set({
					id : ctx.id,
					active : true
				})
				.url(uri)
				.fetch();

		})
		.on('deactivate', function(uri){

			var resource = appModel.get('resource');

			resource.set('active', false);

		})

app.listen();

```

## API

### Router()

Create a new Router instance

### Router#route( path )

Create a new route. 

### Router#route.on

A route is a Hyperbone event emitter. The two significant events are 'activate' and 'deactivate'. Activate handlers are passed a context object `ctx` which contains the paramters of the url as per PageJS. It is shared between all activate handlers for that route. You can register as many activate handlers as you like. 

### Router#listen

Begin listening for routes

### Router#navigateTo(uri, options)
### require('hyperbone-router').navigateTo(uri, options)

Navigate to a different route. If you want to make sure that the route handlers fire even if the route hasn't changed, use `{trigger : true}` as per Backbone as `options`.

## Testing

Install testing tools. You probably need PhantomJS on your path.

```back
  $ npm install && npm install -g grunt-cli
```

Run the tests:

```bash
  $ grunt test
```

## License

  MIT
