const [deleteProduct] = useMutation(DELETE_PRODUCT, {
  update(cache, { data: { deleteProduct } }) {
    // console.log("deleteProduct:", deleteProduct);
    // console.log("before refetchqueries");
    // console.log("inside try block of (GET_VALIDPRODUCTS)");
    // console.log("deleteProduct", deleteProduct);

    getValidProducts();
    var validProducts = validProducts_data;
    console.log("validProducts inside update:", validProducts);
    // getValidProducts().then((result) => {
    //   console.log("result:", result);
    //   return (validProducts = result);
    // });
    // console.log("validProducts_data query:", validProducts);
    try {
      // var { validProducts } =  cache.readQuery({
      //   query: GET_VALIDPRODUCTS,
      // });
      // console.log("before refetchqueries");
      // console.log("inside try block of (GET_VALIDPRODUCTS)");
      // console.log("deleteProduct", deleteProduct);
      // await getValidProducts();
      // // console.log(getValidProducts());
      // var validProducts = await validProducts_data;
      // console.log("validProducts_data query:", validProducts);
      //const { data } =  useQuery(GET_VALIDPRODUCTS).data;
      //console.log("inside try: validProducts:", validProducts);
      //validProducts = data;
    } catch (err) {
      console.log("error:", err.message);
      console.log("handling the cache error... (GET_VALIDPRODUCTS)");
    } finally {
      console.log("in finally block");
      cache.writeQuery({
        query: GET_VALIDPRODUCTS,
        data: {
          validProducts: validProducts.filter(
            (product) => product.id !== deleteProduct.id
          ),
        },
      });
    }

    //var deletedProducts;
    try {
      // var { deletedProducts } = cache.readQuery({
      //   query: GET_DELETEDPRODUCTS,
      // });
      //const { data } = useQuery(GET_DELETEDPRODUCTS);
      var deletedProducts = _data;
    } catch (err) {
      console.log("handling the cache error... (GET_DELETEDPRODUCTS)");
      const { data } = useQuery(GET_DELETEDPRODUCTS);
      console.log("data:", data);
      deletedProducts = data;
    } finally {
      cache.writeQuery({
        query: GET_DELETEDPRODUCTS,
        data: {
          deletedProducts: [...deletedProducts, deleteProduct],
        },
      });
    }
  },
});
