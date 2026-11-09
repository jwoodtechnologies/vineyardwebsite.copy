<?php
/** Share modal + translate list (verbatim from original markup). */
if ( ! defined( 'ABSPATH' ) ) { exit; }
$vc_url = is_singular() ? get_permalink() : home_url( '/' );
?>
<div id="share-translate">
	
	<section id="modal-section">
		<button type="button" class="share-btn floating-share-btn" data-toggle="modal" data-target="#shareModal" >
		<i class="fa fa-share-alt"></i>
		<span>Share <span class="sr-only">this page</span></span>
	</button>

	<div class="modal fade" id="shareModal" tabindex="-1" role="dialog" aria-labelledby="shareModal">
		<div class="modal-dialog modal-lg" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h2 class="modal-title" id="myModalLabel">Share this page</h2>
					<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				</div>
				<div class="modal-body">
					<div class="copylink">
						<p>Copy and paste this code into your website.</p>
						<pre class="py-3 px-4">&lt;a href="<?php echo esc_url( $vc_url ); ?>">Your Link Name&lt;/a&gt;</pre>
					</div><!-- /.copylink -->
					<div class="share-btns">
						<p>Share this page on your favorite Social network</p>
						<div class="row">
							<div class="col-sm-4">
								<a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo rawurlencode( $vc_url ); ?>" class="btn-facebook" onclick="return !window.open(this.href, 'facebook ', 'width=500,height=500')"
								target="_blank">
									<i class="fa fa-facebook"></i> Facebook
								</a>
							</div>
							<div class="col-sm-4">
								<a href="https://www.twitter.com/intent/tweet?url=<?php echo rawurlencode( $vc_url ); ?>" class="btn-twitter" onclick="return !window.open(this.href, 'twitter ', 'width=500,height=500')"
								target="_blank">
									<i class="fa fa-twitter"></i> Twitter
								</a>
							</div>
							<div class="col-sm-4">
								<a href="https://www.reddit.com/submit?url=<?php echo rawurlencode( $vc_url ); ?>" class="btn-reddit" onclick="return !window.open(this.href, 'redit ', 'width=500,height=500')"
								target="_blank">
									<i class="fa fa-reddit"></i> Reddit
								</a>
							</div>
						</div><!-- /.row -->
					</div><!-- /.share-btns -->
					<button type="button" class="btn btn-success btn-lg" data-dismiss="modal">Close</button>
				</div><!-- /.modal-body -->
			</div>
		</div><!-- /.modal-dialog -->
	</div><!-- /.modal -->
</section><!-- /#modal-section -->
	<div id="google-translate" class="d-none">
		<script>
			function googleTranslateElementInit() {
				new google.translate.TranslateElement({pagelanguage: 'en',
					layout: google.translate.TranslateElement.InlineLayout.SIMPLE},
					'google-translate');
			}
		</script>
	</div><!--/#google-translate-->
	<ul id="translation-links">
		<li><button type="button" id="translate-button" aria-label="translate website" aria-haspopup="true" aria-expanded="false"><img src="<?php echo esc_url( vineyard_asset( 'images/translate-icon.png' ) ); ?>" alt="translate icon"/></button>
		<ul class="clearfix" aria-labelledby="translate-button">
				<li><a href="#" class="English" data-lang="English"><strong translate="no">English</strong></a></li>
				<li><a href="#" class="Afrikaans" data-lang="Afrikaans">Afrikaans</a></li>
				<li><a href="#" class="Albanian" data-lang="Albanian">Albanian</a></li>
				<li><a href="#" class="Arabic" data-lang="Arabic">Arabic</a></li>
				<li><a href="#" class="Armenian" data-lang="Armenian">Armenian</a></li>
				<li><a href="#" class="Azerbaijani" data-lang="Azerbaijani">Azerbaijani</a></li>
				<li><a href="#" class="Basque" data-lang="Basque">Basque</a></li>
				<li><a href="#" class="Belarusian" data-lang="Belarusian">Belarusian</a></li>
				<li><a href="#" class="Bengali" data-lang="Bengali">Bengali</a></li>
				<li><a href="#" class="Bosnian" data-lang="Bosnian">Bosnian</a></li>
				<li><a href="#" class="Bulgarian" data-lang="Bulgarian">Bulgarian</a></li>
				<li><a href="#" class="Catalan" data-lang="Catalan">Catalan</a></li>
				<li><a href="#" class="Cebuano" data-lang="Cebuano">Cebuano</a></li>
				<li><a href="#" class="Chinese" data-lang="Chinese (Simplified)">Chinese (Simplified)</a></li>
				<li><a href="#" class="Chinese" data-lang="Chinese (Traditional)">Chinese (Traditional)</a></li>
				<li><a href="#" class="Croatian" data-lang="Croatian">Croatian</a></li>
				<li><a href="#" class="Czech" data-lang="Czech">Czech</a></li>
				<li><a href="#" class="Danish" data-lang="Danish">Danish</a></li>
				<li><a href="#" class="Dutch" data-lang="Dutch">Dutch</a></li>
				<li><a href="#" class="Esperanto" data-lang="Esperanto">Esperanto</a></li>
				<li><a href="#" class="Estonian" data-lang="Estonian">Estonian</a></li>
				<li><a href="#" class="Filipino" data-lang="Filipino">Filipino</a></li>
				<li><a href="#" class="Finnish" data-lang="Finnish">Finnish</a></li>
				<li><a href="#" class="French" data-lang="French">French</a></li>
				<li><a href="#" class="Galician" data-lang="Galician">Galician</a></li>
				<li><a href="#" class="Georgian" data-lang="Georgian">Georgian</a></li>
				<li><a href="#" class="German" data-lang="German">German</a></li>
				<li><a href="#" class="Greek" data-lang="Greek">Greek</a></li>
				<li><a href="#" class="Gujarati" data-lang="Gujarati">Gujarati</a></li>
				<li><a href="#" class="Haitian Creole" data-lang="Haitian Creole">Haitian Creole</a></li>
				<li><a href="#" class="Hausa" data-lang="Hausa">Hausa</a></li>
				<li><a href="#" class="Hebrew" data-lang="Hebrew">Hebrew</a></li>
				<li><a href="#" class="Hindi" data-lang="">Hindi</a></li>
				<li><a href="#" class="Hmong" data-lang="Hmong">Hmong</a></li>
				<li><a href="#" class="Hungarian" data-lang="Hungarian">Hungarian</a></li>
				<li><a href="#" class="Icelandic" data-lang="Icelandic">Icelandic</a></li>
				<li><a href="#" class="Igbo" data-lang="Igbo">Igbo</a></li>
				<li><a href="#" class="Indonesian" data-lang="Indonesian">Indonesian</a></li>
				<li><a href="#" class="Irish" data-lang="Irish">Irish</a></li>
				<li><a href="#" class="Italian" data-lang="Italian">Italian</a></li>
				<li><a href="#" class="Japanese" data-lang="Japanese">Japanese</a></li>
				<li><a href="#" class="Javanese" data-lang="Javanese">Javanese</a></li>
				<li><a href="#" class="Kannada" data-lang="Kannada">Kannada</a></li>
				<li><a href="#" class="Khmer" data-lang="Khmer">Khmer</a></li>
				<li><a href="#" class="Korean" data-lang="Korean">Korean</a></li>
				<li><a href="#" class="Lao" data-lang="Lao">Lao</a></li>
				<li><a href="#" class="Latin" data-lang="Latin">Latin</a></li>
				<li><a href="#" class="Latvian" data-lang="Latvian">Latvian</a></li>
				<li><a href="#" class="Lithuanian" data-lang="Lithuanian">Lithuanian</a></li>
				<li><a href="#" class="Macedonian" data-lang="Macedonian">Macedonian</a></li>
				<li><a href="#" class="Malay" data-lang="Malay">Malay</a></li>
				<li><a href="#" class="Maltese" data-lang="Maltese">Maltese</a></li>
				<li><a href="#" class="Maori" data-lang="Maori">Maori</a></li>
				<li><a href="#" class="Marathi" data-lang="Marathi">Marathi</a></li>
				<li><a href="#" class="Mongolian" data-lang="Mongolian">Mongolian</a></li>
				<li><a href="#" class="Nepali" data-lang="Nepali">Nepali</a></li>
				<li><a href="#" class="Norwegian" data-lang="Norwegian">Norwegian</a></li>
				<li><a href="#" class="Persian" data-lang="Persian">Persian</a></li>
				<li><a href="#" class="Polish" data-lang="Polish">Polish</a></li>
				<li><a href="#" class="Portuguese" data-lang="Portuguese">Portuguese</a></li>
				<li><a href="#" class="Punjabi" data-lang="Punjabi">Punjabi</a></li>
				<li><a href="#" class="Romanian" data-lang="Romanian">Romanian</a></li>
				<li><a href="#" class="Russian" data-lang="Russian">Russian</a></li>
				<li><a href="#" class="Serbian" data-lang="Serbian">Serbian</a></li>
				<li><a href="#" class="Slovak" data-lang="Slovak">Slovak</a></li>
				<li><a href="#" class="Slovenian" data-lang="Slovenian">Slovenian</a></li>
				<li><a href="#" class="Somali" data-lang="Somali">Somali</a></li>
				<li><a href="#" class="Spanish" data-lang="Spanish">Spanish</a></li>
				<li><a href="#" class="Swahili" data-lang="Swahili">Swahili</a></li>
				<li><a href="#" class="Swedish" data-lang="Swedish">Swedish</a></li>
				<li><a href="#" class="Tamil" data-lang="Tamil">Tamil</a></li>
				<li><a href="#" class="Telugu" data-lang="Telugu">Telugu</a></li>
				<li><a href="#" class="Thai" data-lang="Thai">Thai</a></li>
				<li><a href="#" class="Turkish" data-lang="Turkish">Turkish</a></li>
				<li><a href="#" class="Ukrainian" data-lang="Ukrainian">Ukrainian</a></li>
				<li><a href="#" class="Urdu" data-lang="Urdu">Urdu</a></li>
				<li><a href="#" class="Vietnamese" data-lang="Vietnamese">Vietnamese</a></li>
				<li><a href="#" class="Welsh" data-lang="Welsh">Welsh</a></li>
				<li><a href="#" class="Yiddish" data-lang="Yiddish">Yiddish</a></li>
				<li><a href="#" class="Yoruba" data-lang="Yoruba">Yoruba</a></li>
				<li><a href="#" class="Zulu" data-lang="Zulu">Zulu</a></li>
			</ul>
		</li>
	</ul><!--/#translation-links-->
</div><!-- /#share-translate -->
