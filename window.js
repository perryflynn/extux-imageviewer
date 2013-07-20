Ext.Loader.setConfig({
    enabled : true,
    paths   : {
        DirectoryListing : 'app',
        'Ext.ux.fiaedotws': 'fiaedotws'
    }
});
Ext.require('*');

Ext.onReady(function(){

   var imagelist = [
      'exampleimages/IMG_20130202_193932.jpg',
      'exampleimages/IMG_20130202_203654.jpg',
      'exampleimages/webshelf-snapshot.png'
   ];

   Ext.require('Ext.ux.fiaedotws.imageviewer.Panel', function() {
      var win = Ext.create('Ext.window.Window', {
         title:'Imageviewer',
         width:800,
         height:600,
         layout:'fit',
         maximizable:true,
         maximized:false,
         bodyPadding:5,
         border:0,
         items: [
            {
               xtype:'imageviewer',
               border:0
            }
         ]
      });

      win.child('imageviewer').setImages(imagelist);
      win.show();
   });

});
