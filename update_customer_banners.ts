import fs from 'fs';
const content = fs.readFileSync('src/CustomerApp.tsx', 'utf-8');

const bannersParsing = `  let parsedBanners: string[] = [];
  try {
    parsedBanners = JSON.parse(settings?.banners || '[]');
  } catch (e) {
    parsedBanners = [];
  }

`;

const beforeSearch = `
        {/* Banners Area */}
        {parsedBanners.length > 0 && (
          <div className="mb-6 overflow-x-auto flex gap-4 snap-x snap-mandatory scrollbar-hide pb-2">
            {parsedBanners.map((url, idx) => (
              <img key={idx} src={url} alt={\`Banner \${idx + 1}\`} className="w-full md:w-[600px] h-48 md:h-64 object-cover rounded-2xl shadow-sm flex-shrink-0 snap-center" />
            ))}
          </div>
        )}

        {/* Mobile Search */}`;

let updatedContent = content.replace('  const categories = Array.from(new Set(menu.map(i => i.category)));', bannersParsing + '  const categories = Array.from(new Set(menu.map(i => i.category)));');
updatedContent = updatedContent.replace('{/* Mobile Search */}', beforeSearch);

fs.writeFileSync('src/CustomerApp.tsx', updatedContent);
