xmljade = require '../lib/index'

@transform = (test) ->
  test.ok xmljade?
  out = xmljade.transform '''
  doctype html
  html
    body
      = $$('/root/text()').join('')
      != $('em')
  ''', '''
  <root>testing <em>one</em> two</root>
  ''', {}
  test.ok out?
  test.deepEqual out, '<!DOCTYPE html><html><body>testing  two<em>one</em></body></html>'
  test.done()
