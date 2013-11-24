# Hyperbone Router

[![Build Status](https://travis-ci.org/green-mesa/hyperbone-router.png?branch=master)](https://travis-ci.org/green-mesa/hyperbone-router)

Of all the parts of Hyperbone, this is probably the most peculiar and least necessary: Hyperbone is made of individual modules and just about any router will do in place of this.

However, right now, we need a router that supports express style routes **and** hashbangs, so this is what this is for. It's also designed to be at least in the Hyperbone family - it makes use of Hyperbone events for registering callbacks. Page activation and page teardown are the priority rather than server side style middleware. 
## Features

- Hashbang based because the particular usecase we have for this module requires this
- Express/Sinatra style route syntax `/blah/:someparam/:someotherparam` etc
- Hyperbone event based. `on('activate', fn)`
- Activate and Deactivate events to subscribe to.

## Installation

```sh
$ component install green-mesa/hyperbone-router
```


## Example Usage

This example is how this router might be used with Hyperbone Model and Hyperbone View for a single screen application that has multiple virtual pages. We start with an application model that contains a separate model for each route, and then we bind the HTML to that model. Using the `hb-with` attribute we can turn sections of the HTML into partials for each route model. 

Every time a route is activated we update the model for that route. That could be via code or by updating the uri and then fetching from a server. Either way the view is updated automatically.

Setting up the application model and the view...

```js
var Router = require('hyperbone-router').Router;

// our appModel contains two models
var appModel = new HyperboneModel({
	// our list of products. Note the HAL hypermedia..
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
	// a stub model for the product route
	product : {
		active : false
	},
	// a stub model for the resource route
	resource : {
		active : false
	}
});

// bind our application model to our HTML
var view = new HyperboneView({
	el : '#application-root',
	model : appModel
});
```

This is some example HTML. It shows how we render the list of products, taking advantage of the hypermedia extensions to get the correct uri and using `hb-with` to change the scope from the application model to our route models. 

The `if="active"` means that if product.active is true then the product section element will be displayed. 

```html
<section id="applications-root">
	<section>
		<ul hb-with="product-list">
			<li><a href="#!{{url()}}">Product: {{title}}</a></li>
		</ul>
	</section>
	<section hb-with="product" if="active">
		<h3>I'm the product route. This is product ID {{id}}</h3>
		<ul hb-with="resource-list">
			<li><a href="#!{{url()}}">Resources in our product: {{title}}</a></li>
		</ul>
	</section>
	<section hb-with="resource" if="active">
		<h3>{{title}}</h3>
		<p>{{description}}</p>
	</section>
</section>
```
Now we need to do a little more coding to set up our logic around handling various routes. This is *not* our business logic - we just want to make sure the right section is displayed depending on the route. 

We don't care here about anything that happens after we've loaded data from a server, or what happens while we're on a particular route.

```js
var app = new Router();

app
	.route('/products/:id') // this route will match any products
		.on('activate', function(ctx, uri){
			// ctx is our context. it has any params gathered from the route.
			// see component/page.js for more
			
			// set active as true so that the product section is displayed
			appModel.set('product.active', true);
			
			// set the id part of the url as an attribute on our model
			appModel.set('product.id', ctx.id);
			
			// update the uri for the product model
			// and trigger a load from the server...
			appModel.get('product')
				.url(uri)
				.fetch();

		})
		.on('deactivate', function(uri){
			
			// set product.active to false which 
			// because of our 'if' attribute will
			// hide the product section
			appModel.set('product.active', false);
		})
	.route('/resources/:id') // this route will match any resources
		.on('activate', function(ctx, uri){

			// same again for resources but in a slightly
			// different style
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

		});
// finally we want the application to start listening for hashchange (History API support may come later)
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
