/**
 *
 * Text for the introduction
 *
 * @author Francois Chabbey
 *
 */


// Ideally we should have string.ts file that exposes strings as a plain key-value object
// this file would be generated when the user load the app, but this is out of the scope of this project

export let tutorialSteps = [
    'How many guards do we need for guarding a museum ? This looks like a complex problem, but we can try to approach' +
    'the solution with some simple intuitions. Let\'s look at a triangle. We can see that we only need one guard. The ' +
    ' guard can see all points in the triangle',
    'Let\'s try the same the thing with a square; if we look at this square, we see that we can split it into two triangles. ' +
    'So we can say that we need at most two guards, one for each triangle. ',
    'And if we look at any arbitrary polygon, it seems that we can break it into multiple triangles. And actually this is a proven fact.' +
    ' So we have a first intuition that if a shape can be broken into n triangles, then we need at most n guards',
    ' Now if we go back to our square, we can see that if we place a guard at the right place, then two triangles will be guarded,' +
    'So we have an intuition that if we place a guard at one vertex, then it will guard all the triangles that use this vertex ' +
    'We can use this knowledge to have less guard',
    ' If we go back to our triangle, what we want is to have only one guard for it. We know the guard will be positioned on one' +
    ' vertex. We can assign a different color to each vertex, red for the guard, green and blue for he others',
    ' Now, if we have multiple triangles, we want to keep this coloring scheme, so we will minimize the number of guards',
    ' So the trick is to start with the first vertex, put one guard, then put the two other colors, and then colorize triangles' +
    ' that share the a common edge with the triangle we just colorize',
    ' Now think about it where do we put our colors ? On every vertices, so we have n vertices to color. That means that' +
    ' the addition of the red vertex, the blue vertex, the green vertex should equal the number of vertix. ' +
    ' Now our goal is to minimize the number of red vertex, so we can safely write r <=  g, r <= b.<br/>' +
    ' With that it mind, suppose that r/3 would be greater that n. Then g and b would be greater than n/3. But then' +
    ' r + g + b would be greater than n; which cannot happen. So we can say that r is at most n/3, and so we have an upper bound of n/3 for' +
    ' the number of guards. <br/>' +
    ' Now you can try to colorize some museum to convince yourself. Place a guard on a vertex, a guard will keep an eyes ' +
        ' on all triangles that touches this particular vertex' +
        '<div class="try-museum"> Let me try </div>'
];

