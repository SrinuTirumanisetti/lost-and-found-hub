  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    {/* Trending Categories Card */}
    <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold text-white">Trending Categories</CardTitle>
        <TrendingUp className="h-7 w-7 text-pink-200" />
      </CardHeader>
      <CardContent className="p-8 md:p-10">
        <CardDescription className="text-sm text-purple-100 mb-4">Most reported item categories this week</CardDescription>
        {trendingCategories.length === 0 ? (
          <p className="text-purple-100">No trending categories found recently.</p>
        ) : (
          <div className="space-y-4">
            {trendingCategories.map((category, index) => (
              <div key={category.category || index} className="flex items-center justify-between p-3 bg-white bg-opacity-40 rounded-md shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-800 text-white text-lg font-bold shadow">{index + 1}</div>
                  <div>
                    <p className="text-base font-medium text-white">{category.category}</p>
                    <p className="text-sm text-purple-200">{category.count} items</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div> 