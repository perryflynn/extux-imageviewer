
/* Panel */

Ext.define('Ext.ux.fiaedotws.imageviewer.Panel', {
   extend:'Ext.panel.Panel',
   alias:'widget.imageviewer',

   autoScroll:true,
   
   resizeMode:'fit',
   zoomLevel:100,
   mousedowntime:0,
   images:[],
   imageindex:1,
   sourceX:0,
   sourceY:0,
   targetX:0,
   targetY:0,
   panWidth:0,
   panHeight:0,
   orgWidth:0,
   orgHeight:0,
   
   initComponent: function()
   {
      var me = this;
         
      var zoomlevel = Ext.create('Ext.data.Store', {
         fields: [
            { name: 'value', type:'int' }
         ],
         data : [
            { "value":10 },
            { "value":20 },
            { "value":30 },
            { "value":40 },
            { "value":50 },
            { "value":60 },
            { "value":70 },
            { "value":80 },
            { "value":90 },
            { "value":100 },
            { "value":110 },
            { "value":120 },
            { "value":130 },
            { "value":140 },
            { "value":150 }
         ]
      });
         
      this.bbar = [
         { xtype:'tbfill' },
         {
            text:'Previous',
            xid:'prev'
         },
         {
            text:'Next',
            xid:'next'
         },
         {
            text:'Original',
            xid:'org'
         },
         {
            text:'Fit to window',
            xid:'fit'
         },
         {
            text:'Fit vertical',
            xid:'fit-v'
         },
         {
            text:'Fit horizontal',
            xid:'fit-h'
         },
         {
            xtype:'combobox',
            xid:'zoomlevel',
            valueField:'value',
            displayField:'value',
            store:zoomlevel,
            editable:false,
            value:100,
            width:80,
            displayTpl : Ext.create('Ext.XTemplate', '<tpl for=".">', '{value}%', '</tpl>'),
            listConfig: { 
               itemTpl: Ext.create('Ext.XTemplate', '', '{value}%', '')
            }
         },
         { xtype:'tbfill' }
      ];
      
      this.items = [
         {
            xtype:'image',
            src:''
         }
      ];
      
      
      me.callParent();
      
      
      me.on('afterrender', this.onImagePanelRendered, this);
      me.on('resize', this.onPanelResized, this);
      me.on('firstimage', this.onFirstImage, this);
      me.on('lastimage', this.onLastImage, this);
      me.on('imagechange', this.onImageChange, this);
      me.child('image').on('afterrender', this.onImageRendered, this);
   },
   
   setImages: function(img) {
      this.images = img;
   },
   
   // Events -----------------------------------------------------------------------------------------
   
   onImagePanelRendered: function() {
      var me = this;
      var bdy = this.body;
      bdy.on('mousedown', this.onImagePanelMouseDown, this);
      bdy.on('mouseup', this.onImagePanelMouseUp, this);

      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];      
      Ext.each(tb.query('button'), function(btn) {
         btn.on('click', me.onToolbarButtonClicked, me);
      });
      
      tb.child('combobox[xid=zoomlevel]').on('change', this.onZoomlevelChanged, this);
      tb.child('combobox[xid=zoomlevel]').on('select', this.onZoomlevelSelected, this);
      
      this.fireEvent('resize');
   },
   
   onPanelResized: function() {
      this.panWidth = Ext.get(this.body.dom.id).getWidth()-20;
      this.panHeight = Ext.get(this.body.dom.id).getHeight()-5;
      this.resize();
   },
   
   onImagePanelMouseDown: function(e) {
      if(e.button==0) {
         this.mousedowntime = new Date().getTime();
         this.sourceX = this.targetX = e.browserEvent.clientX;
         this.sourceY = this.targetY = e.browserEvent.clientY;
         this.body.on('mousemove', this.onBodyMouseMove, this);
         e.stopEvent();
      }
   },
   
   onImagePanelMouseUp: function(e) {
      if(e.button==0) {
         
         var klicktime = ((new Date().getTime())-this.mousedowntime);
         
         if(klicktime<180 && (this.targetX-this.sourceX)<5 && 
            (this.targetX-this.sourceX)>-5 && (this.targetY-this.sourceY)<5 && 
            (this.targetY-this.sourceY)>-5) 
         {
            this.next();
         }
         
         this.body.un("mousemove", this.onBodyMouseMove, this);
         
      }
      this.mousedowntime = 0;
   },
   
   onBodyMouseMove: function(e) {
      this.scrollBy((this.targetX-e.browserEvent.clientX), (this.targetY-e.browserEvent.clientY));
      this.targetX = e.browserEvent.clientX;
      this.targetY = e.browserEvent.clientY;
   },
   
   onImageChange: function() {
      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      tb.child('button[xid=next]').enable();
      tb.child('button[xid=prev]').enable();
   },
   
   onFirstImage: function() {
      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      tb.child('button[xid=prev]').disable();
   },
   
   onLastImage: function() {
      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      tb.child('button[xid=next]').disable();
   },
   
   onToolbarButtonClicked: function(btn) {
      if(btn.xid=="fit") {
         this.resizeMode = "fit";
      }
      if(btn.xid=="fit-h") {
         this.resizeMode="fith";
      }
      if(btn.xid=="fit-v") {
         this.resizeMode = "fitv";
      }
      if(btn.xid=="org") {
         this.resizeMode = null;
      }
      if(btn.xid=="fit" || btn.xid=="fit-h" || btn.xid=="fit-v" || btn.xid=="org") {
         this.resize();
      }
      if(btn.xid=="next") {
         this.next();
      }
      if(btn.xid=="prev") {
         this.prev();
      }
   },
   
   onZoomlevelChanged: function(combo, newval) {
      this.zoomLevel=newval;
   },
   
   onZoomlevelSelected: function(combo, records) {
      this.resizeMode="zoom";
      this.zoomLevel = records[0].raw.value;
      this.imageZoom(this.zoomLevel);
   },
   
   onImageRendered: function(img) {
      var me = this;
      img.el.on({
         load: function (evt, ele, opts) {
            ele.style.width="";
            ele.style.height="";
            me.orgWidth = Ext.get(ele).getWidth();
            me.orgHeight = Ext.get(ele).getHeight();
            me.resize();
            me.fireEvent('imageloaded');
            me.child('image').setLoading(false);
         },
         error: function (evt, ele, opts) {

         }
      });
      this.prev();
   },
   
   
   // Methods ----------------------------------------------------------------------------------------
   
   resize: function() {
      if(this.resizeMode=="fit") {
         this.imageFit();
      }
      else if(this.resizeMode=="fith") {
         this.imageFitHorizontal();
      }
      else if(this.resizeMode=="fitv") {
         this.imageFitVertical();
      }
      else if(this.resizeMode==null) {
         this.imageFitNot();
      }
      this.imageZoom(this.zoomLevel);
   },
   
   imageFit: function() {
      var pwidth = this.panWidth;
      var pheight = this.panHeight;
      var iwidth = this.orgWidth;
      var iheight = this.orgHeight;
      
      if ((iwidth * pheight / iheight) > pwidth) {
         this.imageFitHorizontal();
      } else {
         this.imageFitVertical();
      }
   },
   
   imageFitHorizontal: function() {
      var pwidth = this.panWidth;
      var pheight = this.panHeight;
      var iwidth = this.orgWidth;
      var iheight = this.orgHeight;
      
      if(iwidth>=pwidth) {
         var perc = Math.round(((100/iwidth*pwidth)*100))/100;
         var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
         tb.child('combobox[xid=zoomlevel]').setValue(perc);
         this.imageZoom(this.zoomLevel);
      } else {
         this.imageFitNot();
      }
   },
   
   imageFitVertical: function(changemode) {
      var pwidth = this.panWidth;
      var pheight = this.panHeight;
      var iwidth = this.orgWidth;
      var iheight = this.orgHeight;

      if(iheight>=pheight) {
         var perc = Math.round(((100/iheight*pheight)*100)-150)/100;
         var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
         tb.child('combobox[xid=zoomlevel]').setValue(perc);
         this.imageZoom(this.zoomLevel);
      } else {
         this.imageFitNot();
      }
   },
   
   imageZoom: function(level) {
      var iwidth = this.orgWidth;
      var iheight = this.orgHeight;
      this.child('image').getEl().dom.style.width=parseInt((iwidth/100*level))+"px";
      this.child('image').getEl().dom.style.height=parseInt((iheight/100*level))+"px";
   },
   
   imageFitNot: function(changemode) {
      var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
      tb.child('combobox[xid=zoomlevel]').setValue(100);
      this.imageZoom(this.zoomLevel);
   },
   
   setImage: function(img) {
      var ip = this.child('image');
      ip.setLoading('Load '+img+'...');
      ip.setSrc(img);
   },
   
   next: function() {
      if(this.images[(this.imageindex+1)]) {
         this.imageindex++;
         this.setImage(this.images[this.imageindex]);
         this.fireEvent('imagechange');
         this.fireEvent('nextimage');
         if((this.images.length-1)<=this.imageindex) {
            this.fireEvent('lastimage');
         }
      }
   },
   
   prev: function() {
      if(this.images[(this.imageindex-1)]) {
         this.imageindex--;
         this.setImage(this.images[this.imageindex]);
         this.fireEvent('imagechange');
         this.fireEvent('previousimage');
         if(this.imageindex<=0) {
            this.fireEvent('firstimage');
         }
      }
   },
   


});

