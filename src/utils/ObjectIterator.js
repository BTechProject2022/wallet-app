


var jDepthLvl = 0;
var result = "";

export default function visit(object, objectAccessor=null) {
//   var result = "";
  jDepthLvl++;
  if (isIterable(object)) {
    if(objectAccessor === null) {
    //   console.log("%c ⇓ ⇓ printing object $OBJECT_OR_ARRAY$ -- START ⇓ ⇓", "background:yellow");
      jDepthLvl=0;
      result = "";
    } else{
    //   result = "";  
    //   console.log("%c"+spacesDepth(jDepthLvl)+objectAccessor+"%c:","color:purple;font-weight:bold", "color:black");
      result += "\n"+spacesDepth(jDepthLvl)+objectAccessor;
    }
    forEachIn(object, function (accessor, child) {
      visit(child, accessor);
    });
  } else {
    var value = object;
    // console.log("%c"
    //   + spacesDepth(jDepthLvl)
    //   + objectAccessor + "=%c" + value + "%c "
    //   ,"color:blue","color:red","color:blue");
      result +="\n"+spacesDepth(jDepthLvl)
      + objectAccessor + "=" + value+"\n";
  }
  if(objectAccessor === null) {
    // console.log("%c ⇑ ⇑ printing object $OBJECT_OR_ARRAY$ -- END ⇑ ⇑", "background:yellow");
    // console.log("IN result screen="+result);
    return result;
  }
  jDepthLvl--;
  
}

function spacesDepth(jDepthLvl) {
  let jSpc="";
  for (let jIter=0; jIter<jDepthLvl-1; jIter++) {
    jSpc+="\u0020\u0020"
  }
  return jSpc;
}

function forEachIn(iterable, functionRef) {
  for (var accessor in iterable) {
    functionRef(accessor, iterable[accessor]);
  }
}

function isIterable(element) {
  return isArray(element) || isObject(element);
}

function isArray(element) {
  return element.constructor == Array;
}

function isObject(element) {
  return element.constructor == Object;
}


// visit($OBJECT_OR_ARRAY$);