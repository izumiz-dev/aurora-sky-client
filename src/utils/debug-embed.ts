// Debug utility to log embed structure
export const debugEmbed = (post: any) => {
  if (post.embed) {
    console.log('=== EMBED DEBUG ===');
    console.log('Embed type:', post.embed.$type);
    console.log('Full embed structure:', JSON.stringify(post.embed, null, 2));

    // Log specific details based on type
    if (post.embed.$type?.includes('images')) {
      console.log('Images count:', post.embed.images?.length);
      console.log('First image:', post.embed.images?.[0]);
    }

    if (post.embed.$type?.includes('external')) {
      console.log('External URI:', post.embed.external?.uri);
      console.log('External title:', post.embed.external?.title);
      console.log('External thumb:', post.embed.external?.thumb);
    }

    if (post.embed.$type?.includes('record')) {
      console.log('Record URI:', post.embed.record?.uri);
      console.log('Record author:', post.embed.record?.author);
      console.log('Record value:', post.embed.record?.value);
    }

    console.log('===================');
  }
};
