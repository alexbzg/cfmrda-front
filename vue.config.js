module.exports = {
    devServer: {
	    disableHostCheck: true,
        public: 'dev.cfmrda.ru',
	    watchOptions: {
	        ignored: "*.json"
	    }
    },
    pages: {
        index: {
            entry: 'src/main.js',
            template: 'src/html/index.html',
            filename: 'index.html'
        },
        viewUpload: {
            entry: 'src/viewUpload.js',
            template: 'src/html/viewUpload.html',
            filename: 'viewUpload.html'
        }
   }
}
