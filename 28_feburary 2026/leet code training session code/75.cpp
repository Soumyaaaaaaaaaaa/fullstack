class Solution {
public:
    void sortColors(vector<int>& nums) 
    {
        int i=0;
        int n=nums.size();
        int mid =0;
        int low= 0;
        int high=n-1;
        while (mid<=high){
      if (nums [mid]==0){
      swap (nums [low],nums[mid]);
      low++; mid++;}
      else if (nums[mid]==1){
      }
        else{
      swap (nums[high],nums[mid]);
      high --;
        }
      }
      
    }
};