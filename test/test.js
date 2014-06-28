var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var hyperboneRouter = require('../index.js');

var Model = require('hyperbone-model').Model;

describe("suite", function(){

	describe("Environment", function(){

		it("has a working environment", function(){

			should.exist(hyperboneRouter);

		});

	});

	describe("Registering routes", function(){

		var Router = hyperboneRouter.Router;

		beforeEach(function(){

			hyperboneRouter.reset();

			loc = window.location.href.replace(window.location.hash, '');
			window.location.href = loc + "#!";

		});

		it('can define a route and it works', function( done ){

			var router = new Router(), loc, count = 0;

			router.route('/test').on('activate', function(ctx, path){

				count ++;

				expect(count).to.equal(1);

				expect(ctx.length).to.equal(0);
				expect(path).to.equal('/test');

				done();

			}).listen();

			loc = window.location.href.replace(window.location.hash, '');

			window.location.href = loc + "#!/test";

		});

		it('can define a route with params', function(done){

			var router = new Router(), loc;

			router.route('/test/:id').on('activate', function(ctx, path){

				expect(ctx.id).to.equal('magic');
				expect(path).to.equal('/test/magic');

				done();

			}).listen();

			loc = window.location.href.replace(window.location.hash, '');
			window.location.href = loc + "#!/test/magic";
		});

		it('can fire multiple callbacks for the same route, context is shared', function(done){

			var router = new Router(), loc;

			router.route('/test/:id')
				.on('activate', function( ctx ){
					ctx.count = 1;
				})
				.on('activate', function( ctx ){
					ctx.count++;
				})
				.on('activate', function( ctx ){
					ctx.count++;
					expect(ctx.count).to.equal(3);
					done();
				})
				.listen();

			loc = window.location.href.replace(window.location.hash, '');
			window.location.href = loc + "#!/test/magic";

		});

		it('fires a deactivate signal when navigated away', function(done){

			var router = new Router(), loc;

			router.route('/test/:id')
				.on('activate', function( ctx ){

					ctx.isActivated = true;

					loc = window.location.href.replace(window.location.hash, '');
					window.location.href = loc + "#!/somewhere-else";

				})
				.on('deactivate', function(ctx){
					expect(ctx.isActivated = true);
					done();
				})
				.listen();

			loc = window.location.href.replace(window.location.hash, '');
			window.location.href = loc + "#!/test/magic";

		});

	});

	describe("Manually updating the current hash fragment", function(){


		var Router = hyperboneRouter.Router;

		beforeEach(function(){

			hyperboneRouter.reset();

			loc = window.location.href.replace(window.location.hash, '');
			window.location.href = loc + "#!";

		});	

		it("can change the hash via a static method on the module", function(done){

			var router = new Router(), loc;

			var count = 0;

			router.route('/test/:id')
				.on('activate', function(){

					count ++ ;

					expect(count).to.equal(1);

					expect(window.location.hash).to.equal('#!/test/magic');

					done();

				})
				.listen();

			hyperboneRouter.navigateTo('/test/magic');

		});

		it("can change the hash via a method on a Router instance", function(done){

			var router = new Router(), loc;

			router.route('/test/:id')
				.on('activate', function(){

					expect(window.location.hash).to.equal('#!/test/magic');

					done();

				})
				.listen();

			router.navigateTo('/test/magic');			

		});

		it("can force a route to run all handlers again", function(done){

			var count = 0;

			var router = new Router();

			router.route('/test/:id')
				.on('activate', function(){

					count++;

					if(count === 1){

						hyperboneRouter.navigateTo('/test/magic', { trigger : true });

			
					} else {

						expect(count).to.equal(2);
						done();

					}

				})
				.listen();

			hyperboneRouter.navigateTo('/test/magic');

		})

	});

	describe("Conventions", function(){

		var Router = hyperboneRouter.Router;

		beforeEach(function(){

			hyperboneRouter.reset();

			loc = window.location.href.replace(window.location.hash, '');
			window.location.href = loc + "#!";

		});	

		it("Applies some default handlers to models", function( done ){

			var router = new Router();

			var model = new Model();

			router.route('/test/:id', model)
				.on('activate', function(){
					expect(model.get('active')).to.equal(true);

					router.navigateTo('/somewhere-else');
				})
				.on('deactivate', function(){
					expect(model.get('active')).to.not.equal(false);
					done();
				})
			
			router.listen();

			router.navigateTo('/test/magic');

		})

	});


});