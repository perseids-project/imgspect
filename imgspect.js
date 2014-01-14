.menumucil {
	overflow: hidden;
}

.menumucil .pane {
	overflow: hidden;
	margin: 0;
	opacity: 1;
}

.menumucil .pane .inner {
	padding: 0;
	overflow: hidden;
}

.menumucil .pane.transitions {
	transition-property: all;
	-moz-transition-property: all;		/* Firefox 4 */
	-webkit-transition-property: all;	/* Safari and Chrome */
	-o-transition-property: all;		/* Opera */

	transition-duration: .5s;
	-moz-transition-duration: .5s;		/* Firefox 4 */
	-webkit-transition-duration: .5s;	/* Safari and Chrome */
	-o-transition-duration: .5s;			/* Opera */

	transition-timing-function: ease-in;
	-moz-transition-timing-function: ease-in;		/* Firefox 4 */
	-webkit-transition-timing-function: ease-in;	/* Safari and Chrome */
	-o-transition-timing-function: ease-in;			/* Opera */

	transition-delay: 0;
	-moz-transition-delay: 0;		/* Firefox 4 */
	-webkit-transition-delay: 0;	/* Safari and Chrome */
	-o-transition-delay: 0;			/* Opera */
}
.imgbit {
	display: inline-block;
}
.imgbit .view {
	position: relative;
	overflow: hidden;
}

.imgbit img.star {
	position: absolute;
	display: block;
	vertical-align: baseline;
	max-width: none;
	max-height: none;
}

.imgbit.full,
.imgbit.edit {
	background-color: #f2f2f2;
	padding: 5px;
	margin: 5px;
	font-family: 'Lucida Console', 'Monaco', sans-serif;
}

.imgbit.full .source,
.imgbit .close {
	float: right;
	background-color: #DFDFDF;
	color: #FF8888;
	margin-bottom: 2px;
	text-decoration: none;
	padding: 2px 6px;
	font-size: 9px;
}

.imgbit .close {
	color: #444;
	margin-bottom: 5px;
}

.imgbit .close:hover {
	color: #FF8888;
}

.imgbit.edit .switcher {
	margin-top: 2px;
}

.imgbit.full .source:hover {
	color: #FF4444;
}

.imgbit.full .text,
.imgbit.edit .text {
	word-wrap: break-word;
	padding: 5px;
}

.imgbit.edit .caption {
	overflow: hidden;
	display: block;
	word-wrap: break-word;
	margin: 0;
	border: none;
	outline: none;
	padding: 6px 5px 4px 5px;
	resize: none;
}

.imgbit .text,
.imgbit.edit .caption {
	font-family: 'Lucida Console', 'Monaco', sans-serif;
	font-size: 15px;
}

.imgbit.edit .text {
	min-height: 16pxd;
}
.imgspect {
	font-family: 'Lucida Console', 'Monaco', sans-serif;
	width: auto;
	background-color: #222;
}

.imgspect .view {
	height: 400px;
	position: relative;
	overflow: hidden;
	margin-bottom: 20px;
}

.imgspect .nav {
	float: left;
	max-width: 640px;
	max-height: 400px;
	display: block;
}

.imgspect .draw {
	float: left;
	position: absolute;
	display: block;
	vertical-align: baseline;
	max-width: none;
	max-height: none;
	margin-right: 10px;
	background-size: cover;
}

.imgspect .drag {
	position: absolute;
	z-index: 100;
	background-color: #FFF;
	opacity: .3;
	outline: 1px solid #444;
	border: 1px solid #BBB;
}

.imgspect .tool {
	font-size: 30px;
	display: block;
	float: left;
	margin-right: 5px;
}

.imgspect .lite {
	position: absolute;
}

.imgspect .colors {
	display: block;
}

.imgspect .color.selected {
	border: 1px solid #444;
	outline: 1px solid #BBB;
}

.imgspect {
	padding: 5px;
	margin: 5px;
	padding-bottom: 20px;
}

.imgspect .tools {
	float: left;
}

.imgspect .tools .group {
	display: block;
	clear: both;
}

.imgspect .tool {
	background-color: #444;
	color: #888888;
	margin-top: 5px;
	margin-bottom: 10px;
	text-decoration: none;
	padding: 2px 6px;
	font-size: 20px;
}

#drop .clicker:hover,
.imgspect .tool:hover {
	color: #FF8888;
}

.imgspect .output {
	color: #888;
	word-wrap: break-word;
	margin-right: 5px;
	border: none;
	outline: none;
	background-color: #111;
	padding: 6px 5px 4px 5px;
	width: 300px;
	overflow-y: scroll;
	text-align: left;
}

.imgspect .output pre {
	margin: 0;
	font-size: 12px;
}

.imgspect .center {
	width: 100%;
	text-align: center;
}

.imgspect .ui {
	display: inline-block;
	width: 955px;
}

#drop {
	width: 100%;
}
#drop .inner {
	background-color: rgba( 0, 0, 0, 0.8 );
	padding: 10px;
}
#drop .inner .imgbit {
	margin: 10px;
}
#drop .clicker {
	display: block;
	width: 100%;
	text-align: center;
	text-decoration: none;
	background-color: rgba( 25, 25, 25, 0.9 );
	color: #666;
	padding: 5px 0;
	font-family: 'Lucida Console', 'Monaco', sans-serif;
	font-size: 25px;
}
