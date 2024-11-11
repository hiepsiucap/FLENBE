const NotFound =(req,res) =>{
   return res.status(404).send('Can not find this path Please Check Again')
}
module.exports =NotFound