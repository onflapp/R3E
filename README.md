# R3E - Recursive Resource Rendering Engine

This project started as kind of an experiment.

I was wondering if I could:
- describe any content (including files, records, configurations, etc.) as simple JSON.
- use javascript function to render the content to different representations (e.g. html or other JSON objects)
- create the render functions out of templates
- store the templates as content

If possible, this would enable me to:
- store content easily in any data source (e.g. file system, database, javascript object)
- content would be data source independent so it could be transferred from one data source to another (off-line sync, broadcast over socket.io)
- since templates are just content, I could replicate functionality as well as data
- client-side and server-side rendering would be fully interchangeable

R3E relies on naming convention to find the right *renderer*. It uses content *renderTypes* and *selectors* to lookup (resolve) appropriate renderer function from a template. This is very, very loosely based on concepts introduced by [Apache Sling](https://sling.apache.org/documentation/the-sling-engine/url-to-script-resolution.html).

The result of this experiment is compact and modular rendering engine.
Although R3E doesn't rely on traditional "repository" for storage, R3E resources can be nestable and browsable, which means you'll get light-weight repository capability as nice side-effect.

---

You can test and play with R3E right in your browser https://onflapp.github.io/R3E/tests/client/app.html

Where:

resource <a href="https://onflapp.github.io/R3E/tests/client/app.html#/content/my%20simple%20web%20page.x-res-list" target="_blank">my simple web page</a>
using template <a href="https://onflapp.github.io/R3E/tests/client/app.html#/user-templates/web/page/default.hbs.x-edit" target="_blank">web/page/default.hbs</a>
will be rendered as <a href="https://onflapp.github.io/R3E/tests/client/app.html#/content/my%20simple%20web%20page">web page</a>

---

*Or run in on the server-side*

```
git clone https://github.com/onflapp/R3E.git
npm install
node ./tests/server/app.js
```

# Architecture

R3E is designed to be modular and customizable to fit various use-cases. It includes following layers that are designed to work together but can be used separately as well.

| layer                      | role                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| resource                   | content structure that contains data or template                                                      |
| resource resolver          | resolve 'data' content from a path                                                                    |
| resource renderer          | resolve 'template' and return it as renderer function                                                 |
| request handler + context  | interprets user request (e.g. URL or mouse click), resolves 'data' and uses renderer to create output |
| content writer             | writes 'output' to a channel (e.g. server response or DOM structure)                                  |

# Programmatic Examples

Data content

```javascript
var data = new ObjectResource({
  'my web page':{
    _rt: web/page',
    title: 'hello'
  }
});

```

Notice the *_rt* attribute, this is *path* to resolve template **web/page**


Template as text string

```javascript
var template = new ObjectResource({
  'web': {
    'page': {
      'default.hbs': {
        _content: '<h1>{{_.title}}</h1><p>this is very simple, non-HTML-compliant page</p>'
      }
    }
  }
});

```

Notice the way object is nested as **web/page**. Name of the object has special significance as well. **default** is selector name, whereas **hbs** extension indicates the text needs to go through handlebars script factory which will turn it into appropriate javascript function. You can add additional templating languages by mapping file extension to script factories. Selectors are passed to the render resolvers to 'select' the right renderer, *default* is just a default.

Template can also be just a javascript function

```javascript
var template = new ObjectResource({
  'web': {
    'page': {
      'default.func': function (res, writer, context) {
        writer.start('text/html');
        writer.write('title: ' + res.getProperty('title'));
        writer.end();
      }
    }
  }
});

```

Render resource using template

```javascript
var rres = new ResourceResolver(data);
var rrend = new ResourceResolver(template);

rres.resolveResource('/my web page', function(res) {
  var renderType = res.getType(); // usually comes from _rt
  var selector = 'default';

  rrend.renderResource(res, renderType, selector, {
    start: function(ctype) {},
    end: function() {},
    write: function(output) {
      console.log(output);
    };
  });
});

```


# Points of Interest

- there is no concept of "repository" in traditional sense. Just resources which can be nested together. Resources can be of different types so that you can have resources coming from GitHub in the same tree as file system based resource or simple JSON

- resource is just a data object. It doesn't have any sense of its location or *path* in the resource tree except it knows about its immediate children. It is the resource resolver's task to resolve *path* and return the right resource pointing to it. This makes it possible to have combine different resource trees together. This could be used for example for separating rendering template from content

- mapping a request (e.g. HTTP GET or mouse click) to a resource path is done by request handler. This make is possible to map all kinds of requests / events to the resolver. For example the request itself doesn't have to be RESTfull at all, although the default implementation handles it this way

- renderer is javascript functions which takes resources and writes it to the content writer. Renderer can write out more than just a string, this includes javascript object. This means that renderer can filter resource data or provide API like functionality. Resource itself doesn't care about order of its children in anyway, however you can implement "list-ordered-children" selector which adds it capability and writes out ordered list of children that other renderers can consume

- API is mostly asynchronous, therefore resolving and rendering happens all asynchronously. It is up to the content writer to reorder all written content in the right way and finalize it at once. The default writer does that by providing nesting, buffering and ordering which is fully transparent to the renderer

- resource data are not to be manipulated directly but by using request handler. The request handler supports HTML form-like modification of resource data and simplifies more complex resource and data manipulation tasks like copy, move, delete, import, export and binary data uploads

- as data manipulation is not responsibility of a resource itself, it can be done in consistent way across all resource types, regardless of underlying storage mechanism
