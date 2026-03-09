#include <vector>
using namespace<std>;
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int k =0;
        int n=nums.size();
        vector<int>result(n);

        for (int i=0;i<n;i++){
            if (nums[i]!=0){
                result[k]=nums[i];
                k++;
            }
        }
        for (;k<n;k++){
            result[k]=0;
        }
        for (int i = 0;i<n;i++){
            nums[i] = result[i];
        }
    }
};