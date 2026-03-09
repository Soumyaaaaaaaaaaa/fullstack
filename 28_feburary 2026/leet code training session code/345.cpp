class Solution {
public:
 bool isvowel(char c){
       c = tolower(c);
       return (c=='a'||c=='e'||c=='i'||c=='o'||c=='u');
       }
       
    string reverseVowels(string s){
        int n = s.size();
        string vowel ="";
        {

            for (int i=0;i<n;i++){
            if (isvowel(s[i]))
            vowel += s[i];
        }
    int k= vowel.size()-1;

    for (int i=0;i<n;i++){
    if (isvowel (s[i])){
        s[i]= vowel[k];
        k--;
    }
}
 return s;
}
    }
};