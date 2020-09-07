(function() {
  // Regular Expressions for parsing tags and attributes
	var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
      endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
      attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

  // 空标签
  var empty = makeMap('area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr')
  
  // 块级元素标签
  var block = makeMap("a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video")

  // 内联元素标签
  var inline = makeMap("abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var")

  // 自闭合标签
  var closeSelf = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr')

  // 可以被属性值填充，比如：disabled="disabled"
  var fillAttrs = makeMap('checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected')

  // 特殊标签（可以包含别的元素）
  var special = makeMap('script,style')

  var HTMLParser = this.HTMLParser = function(html, handler) {
    var index, chars, match, stack = [], last= html;

    // 我看来是用栈来存储标签，推出栈的头元素
    stack.last = function() {
      return this[this.length - 1]
    }

    while (html) {
      chars = true

      // 不在script和style标签内的其余html标签
      if (!stack.last() || !special[stack.last()]) {

        // 注释标签
        if (html.indexOf('<!--') == 0) {
          index = html.indexOf('-->')

          if (index >= 0) {
            if (handler.comment) {
              handler.comment(html.substring(4, index))
            }
            html = html.substring(index + 3)
            chars = false
          }

        } 
        // 标签闭合符
        else if (html.indexOf('</') == 0) {
          match = html.match(endTag)

          if (match) {
            html = html.substring(match[0].length)
            match[0].replace(endTag, parseEndTag)
            chars = false
          }
        }
        // 标签开始符
        else if (html.indexOf('<') == 0) {
          match = html.match(startTag)

          if (match) {
            html = html.substring(match[0].length)
            match[0].replace(startTag, parseStartTag)
            chars = false
          }
        }

        if (chars) {
          index = html.indexOf('<')
          var text = index < 0 ? html : html.substring(0, index)
          html = index < 0 ? '' : html.substring(index)

          if (handler.chars) {
            handler.chars(text)
          }
        }
      }
    }
  }

  function makeMap(str) {
    var obj = {}, items = str.split(',');
    for (var i = 0; i < items.length; i++) {
      obj[items[i]] = true
    }
    return obj
  }
})();