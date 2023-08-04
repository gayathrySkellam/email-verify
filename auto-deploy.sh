cd /opt/tomcat
git clone https://github.com/ashwinThomas04/email-verify.git
echo "Repository cloned..."
cd /opt/tomcat/webapps/ROOT
rm -rf *
mv /opt/tomcat/email-verify/* /opt/tomcat/webapps/ROOT/.
echo "moved folder"
cd /opt/tomcat
rm -rf email-verify
echo "script complete"