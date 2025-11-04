

//GET /api/user

export const getUserData = async (resizeBy, res) => {
    try {
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        res.json({ success: true, role, recentSearchedCities })
    } catch (error) {
        res.json({ success: false, message: error.message })


    }
}

//Store User Recent Searches
export const storeRecentSearchCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = await req.user;

        if (user.recentSearchedCities.length < 3) {
            user.recentSearchedCities.push(recentSearchedCity);
        } else {
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity);
        }
        await user.save();
        res.json({ success: true, message: "Recent search updated successfully!" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}