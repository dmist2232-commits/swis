const fs = require('fs');
let code = fs.readFileSync('src/CustomerApp.tsx', 'utf8');

code = code.replace(
`          <div className="mb-8 overflow-x-auto flex gap-4 snap-x snap-mandatory scrollbar-hide pb-2">
            {parsedBanners.map((url, idx) => (
              <img key={idx} src={url} alt={\`Banner \${idx + 1}\`} className="w-full md:w-full h-48 md:h-[450px] object-cover rounded-2xl shadow-sm flex-shrink-0 snap-center" />
            ))}
          </div>`,
`          <div className="mb-8 overflow-x-auto flex gap-4 snap-x snap-mandatory scrollbar-hide pb-2">
            {parsedBanners.map((url, idx) => {
              const isVideo = url.match(/\\.(mp4|webm|ogg)$/i) || url.includes('video');
              return isVideo ? (
                <video key={idx} src={url} autoPlay loop muted playsInline className="w-full md:w-full h-48 md:h-[450px] object-cover rounded-2xl shadow-sm flex-shrink-0 snap-center" />
              ) : (
                <img key={idx} src={url} alt={\`Banner \${idx + 1}\`} className="w-full md:w-full h-48 md:h-[450px] object-cover rounded-2xl shadow-sm flex-shrink-0 snap-center" />
              );
            })}
          </div>`
);

fs.writeFileSync('src/CustomerApp.tsx', code);
