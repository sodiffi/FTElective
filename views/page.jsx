// import 'semantic-ui-css/semantic.min.css'
var React = require("react")
class Page extends React.Component {
    // constructor(props)
    render() {
        
        return (<>

            <html>
                <head>
                    <title>北商財稅系人工選課</title>
                    <script src="https://cdn.jsdelivr.net/npm/jquery@3.3.1/dist/jquery.min.js"></script>
                    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/fomantic-ui@2.8.8/dist/semantic.min.css" />
                    <script src="https://cdn.jsdelivr.net/npm/fomantic-ui@2.8.8/dist/semantic.min.js"></script>
                    

                    <link rel="icon" href="images/icon.ico" type="image/x-icon" />
                    <link rel='stylesheet' href='/stylesheets/style.css' />
                </head>
                <body> {this.props.children}  </body>

            </html>
        </>)
    }
}
module.exports=Page